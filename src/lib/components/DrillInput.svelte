<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { VocabularyItem, NounEntry, VerbEntry, Language, Gender } from '$lib/data/vocabulary';
  import { getArticle } from '$lib/data/vocabulary';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { progressStore } from '$lib/stores/progress.svelte';
  import { speakText, unlockSpeech } from '$lib/utils/speech';
  import type { DrillPhase } from '$lib/types';

  interface Props {
    word: VocabularyItem;
    onComplete: (correct: boolean) => void;
    onNext: () => void;
  }

  let { word, onComplete, onNext }: Props = $props();

  // State
  let inputElement: HTMLInputElement | null = $state(null);
  let phase = $state<DrillPhase>('article');
  let userInput = $state('');
  let hasError = $state(false);
  let errorChar = $state('');
  let completedSegments = $state<Array<{ text: string; colorClass?: string }>>([]);
  let hadAnyError = $state(false);
  let showTranslation = $state(false);
  let showTargetExample = $state(false);
  let showBaseExample = $state(false);
  
  // Conjugation overlay state (shown when Control key is held)
  let showConjugationOverlay = $state(false);

  // Derived values
  const isNoun = $derived(word.type === 'noun');
  const noun = $derived(isNoun ? word as NounEntry : null);
  const verb = $derived(!isNoun ? word as VerbEntry : null);
  const settings = $derived(settingsStore.value);
  const targetLang = $derived(settings.targetLanguage);
  const baseLang = $derived(settings.baseLanguage);
  
  // Detect mobile devices
  const isMobile = $derived.by(() => {
    if (typeof navigator === 'undefined') return false; // SSR fallback
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    // Check for mobile devices
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
           (platform.includes('iphone') || platform.includes('ipad') || platform.includes('ipod'));
  });
  
  // Modifier key name (Control for all platforms, null for mobile)
  const modifierKeyName = $derived.by(() => {
    if (typeof navigator === 'undefined') return 'Control'; // SSR fallback
    if (isMobile) return null; // No modifier key on mobile
    return 'Control';
  });
  
  // Toggle conjugation overlay (for mobile)
  function toggleConjugationOverlay(e?: Event) {
    e?.stopPropagation(); // Prevent triggering container click
    showConjugationOverlay = !showConjugationOverlay;
    if (!showConjugationOverlay) {
      // Refocus input after closing
      tick().then(() => {
        inputElement?.focus();
      });
    }
  }

  // Get noun data for target language
  const nounData = $derived.by(() => {
    if (!noun) return null;
    return noun.languages[targetLang];
  });

  // Get verb data for target language
  const verbData = $derived.by(() => {
    if (!verb) return null;
    return verb.languages[targetLang];
  });

  // Get the gender for the noun in target language
  const nounGender = $derived.by((): Gender | undefined => {
    if (!nounData || targetLang === 'en') return undefined;
    if ('gender' in nounData) {
      return (nounData as { gender: Gender }).gender;
    }
    return undefined;
  });

  // Get what the user should type next
  const expectedInput = $derived.by(() => {
    if (isNoun && nounData) {
      switch (phase) {
        case 'article': 
          if (targetLang === 'en') return ''; // English has no gendered articles to test
          return getArticle(targetLang, nounGender);
        case 'singular': 
          return nounData.word;
        case 'plural': 
          return nounData.plural;
        default: return '';
      }
    } else if (verb && verbData) {
      switch (phase) {
        case 'infinitive': 
          // For Norwegian, strip "å " prefix - it's pre-filled
          if (targetLang === 'no' && verbData.infinitive.startsWith('å ')) {
            return verbData.infinitive.slice(2); // Remove "å "
          }
          return verbData.infinitive;
        case 'conjugation': 
          return getVerbConjugation();
        case 'conjugation2':
          return getVerbConjugation2();
        case 'conjugation3':
          return getVerbConjugation3();
        default: return '';
      }
    }
    return '';
  });

  // Get the verb conjugation to test based on target language
  function getVerbConjugation(): string {
    if (!verbData || !verb) return '';
    
    switch (targetLang) {
      case 'de': {
        const de = verb.languages.de;
        return de.indicative.präsens.du;
      }
      case 'fr': {
        const fr = verb.languages.fr;
        return fr.indicative.présent.tu;
      }
      case 'es': {
        const es = verb.languages.es;
        return es.indicative.presente.tú;
      }
      case 'no': {
        const no = verb.languages.no;
        return no.presens;
      }
      case 'en': {
        const en = verb.languages.en;
        return en.simplePast;
      }
      default:
        return '';
    }
  }

  // Get the conjugation label for UI hints
  function getConjugationLabel(): string {
    switch (targetLang) {
      case 'de': return '"du" present tense';
      case 'fr': return '"tu" present tense';
      case 'es': return '"tú" present tense';
      case 'no': return 'present tense';
      case 'en': return 'simple past';
      default: return 'conjugation';
    }
  }

  // Get the conjugation separator (what appears before conjugation)
  function getConjugationSeparator(): string {
    switch (targetLang) {
      case 'de': return ', du ';
      case 'fr': return ', tu ';
      case 'es': return ', tú ';
      case 'no': return ', ';
      case 'en': return ', ';
      default: return ', ';
    }
  }

  // Get the second verb conjugation (perfekt/past form) based on target language
  function getVerbConjugation2(): string {
    if (!verbData || !verb) return '';
    
    switch (targetLang) {
      case 'de': {
        // Full perfekt form: "bist gegangen" or "hast gegessen"
        const de = verb.languages.de;
        return de.indicative.perfekt.conjugation.du;
      }
      case 'fr': {
        // Imparfait form: "allais" or "mangeais"
        const fr = verb.languages.fr;
        return fr.indicative.imparfait.tu;
      }
      case 'es': {
        // Pretérito indefinido form: "fuiste" or "comiste"
        const es = verb.languages.es;
        return es.indicative.pretéritoIndefinido.tú;
      }
      case 'no': {
        // Full perfektum form: "har gått" or "har spist"
        const no = verb.languages.no;
        return `${no.perfektum.auxiliary} ${no.perfektum.partisipp}`;
      }
      case 'en': {
        // Past participle: "gone" or "eaten"
        const en = verb.languages.en;
        return en.pastParticiple;
      }
      default:
        return '';
    }
  }

  // Get the conjugation2 label for UI hints
  function getConjugationLabel2(): string {
    switch (targetLang) {
      case 'de': return '"du" perfekt';
      case 'fr': return '"tu" imparfait';
      case 'es': return '"tú" pretérito indefinido';
      case 'no': return 'perfektum';
      case 'en': return 'past participle';
      default: return 'past form';
    }
  }

  // Get the separator before conjugation2 (what appears before second conjugation)
  function getConjugationSeparator2(): string {
    switch (targetLang) {
      case 'de': return ', du ';
      case 'fr': return ', tu ';
      case 'es': return ', tú ';
      case 'no': return ', ';
      case 'en': return ', ';
      default: return ', ';
    }
  }

  // Get the third verb conjugation (passé composé for French) based on target language
  function getVerbConjugation3(): string {
    if (!verbData || !verb) return '';
    
    switch (targetLang) {
      case 'fr': {
        // Full passé composé form: "es allé(e)" or "as mangé"
        const fr = verb.languages.fr;
        return fr.indicative.passéComposé.conjugation.tu;
      }
      default:
        return '';
    }
  }

  // Get the conjugation3 label for UI hints
  function getConjugationLabel3(): string {
    switch (targetLang) {
      case 'fr': return '"tu" passé composé';
      default: return 'third form';
    }
  }

  // Get the separator before conjugation3 (what appears before third conjugation)
  function getConjugationSeparator3(): string {
    switch (targetLang) {
      case 'fr': return ', tu ';
      default: return ', ';
    }
  }

  // Get color class for article based on gender
  function getGenderColorClass(gender?: Gender): string {
    if (!gender) return '';
    switch (gender) {
      case 'masculine': return 'text-masculine';
      case 'feminine': return 'text-feminine';
      case 'neuter': return 'text-neuter';
      default: return '';
    }
  }

  // Reset state when word changes
  $effect(() => {
    // Trigger on word change
    word;
    targetLang;
    
    // Reset all state
    // For English nouns, skip article phase since no gendered articles
    if (isNoun) {
      phase = (targetLang === 'en') ? 'singular' : 'article';
      completedSegments = [];
    } else {
      phase = 'infinitive';
      // For Norwegian verbs, pre-fill "å " prefix to avoid Control+a triggering overlay
      if (targetLang === 'no' && verbData && verbData.infinitive.startsWith('å ')) {
        completedSegments = [{ text: 'å ' }];
      } else {
        completedSegments = [];
      }
    }
    userInput = '';
    hasError = false;
    errorChar = '';
    hadAnyError = false;
    prefixBeforeComposition = '';
    showTranslation = false;
    showTargetExample = false;
    showBaseExample = false;
    showConjugationOverlay = false;
    
    // Focus input
    tick().then(() => {
      inputElement?.focus();
    });
  });

  
  // Track composition state (for dead keys)
  let isComposing = $state(false);
  
  // Track the validated input BEFORE composition started
  // This is needed because some browsers drop the prefix when completing composition
  let prefixBeforeComposition = $state('');

  // Handle composition start (e.g., dead key to start umlaut)
  function handleCompositionStart() {
    isComposing = true;
    // Remember what was validated before composition
    // We need to extract just the valid prefix, not any dead key characters
    // userInput should be the last validated state
    prefixBeforeComposition = userInput;
  }

  // Handle composition end (composition complete, e.g., 'ä' is now in input)
  function handleCompositionEnd(e: CompositionEvent) {
    isComposing = false;
    const target = e.target as HTMLInputElement;
    const compositionData = e.data || ''; // The composed character (e.g., 'ö')
    let inputValue = target.value;
    
    // KEY FIX: Check if browser dropped the prefix (common bug with dead keys)
    // If the input value doesn't start with our saved prefix, restore it
    if (prefixBeforeComposition.length > 0 && 
        !inputValue.startsWith(prefixBeforeComposition)) {
      // Browser dropped the prefix - restore it
      inputValue = prefixBeforeComposition + compositionData;
      
      // Update the actual input element
      if (inputElement) {
        inputElement.value = inputValue;
      }
    }
    
    validateInput(inputValue);
    
    // IMPORTANT: After composition, ensure cursor is at the end with no selection.
    // Some browsers leave the composed character selected, causing the next keystroke
    // to replace it instead of appending.
    if (inputElement) {
      const len = inputElement.value.length;
      inputElement.setSelectionRange(len, len);
    }
  }

  // Normalize French conjugations: strip (e) notation for comparison
  // Data keeps "es allé(e)" but we accept "es allé"
  function normalizeFrenchConjugation(text: string): string {
    if (targetLang === 'fr') {
      // Remove (e), (e)s, (e)(s) patterns
      return text.replace(/\(e\)/g, '').replace(/\(s\)/g, '');
    }
    return text;
  }

  // Validate input against expected
  function validateInput(newValue: string) {
    // Normalize both expected and user input for French
    const normalizedExpected = normalizeFrenchConjugation(expectedInput);
    const normalizedNewValue = normalizeFrenchConjugation(newValue);
    
    // Check if the new value matches the expected prefix
    const expectedPrefix = normalizedExpected.substring(0, normalizedNewValue.length);
    
    if (normalizedNewValue === expectedPrefix) {
      // Input is correct so far
      hasError = false;
      errorChar = '';
      userInput = newValue;
      
      // Sync input element value and ensure cursor is at end
      if (inputElement && inputElement.value !== newValue) {
        inputElement.value = newValue;
        inputElement.setSelectionRange(newValue.length, newValue.length);
      }
      
      // Check if segment is complete (using normalized comparison for French)
      const normalizedUserInput = normalizeFrenchConjugation(userInput);
      const normalizedExpected = normalizeFrenchConjugation(expectedInput);
      if (normalizedUserInput === normalizedExpected) {
        // For nouns in article phase, keep cursor blinking - user will type space naturally
        if (isNoun && phase === 'article') {
          // Don't auto-advance, wait for user to type space
        } else {
          // For other phases, auto-advance
          completeCurrentPhase();
        }
      }
    } else {
      // Input has an error - find which character is wrong (using normalized strings)
      let errorIndex = 0;
      for (let i = 0; i < normalizedNewValue.length; i++) {
        if (normalizedNewValue[i] !== normalizedExpected[i]) {
          errorIndex = i;
          break;
        }
      }
      
      hasError = true;
      errorChar = normalizedNewValue[errorIndex] || '';
      hadAnyError = true;
      
      // Play error animation
      inputElement?.classList.add('animate-shake');
      setTimeout(() => {
        inputElement?.classList.remove('animate-shake');
      }, 300);
      
      // Reset input to last valid state (use original expectedInput for display)
      const validPart = normalizedExpected.substring(0, errorIndex);
      userInput = validPart;
      if (inputElement) {
        inputElement.value = validPart;
        // Move cursor to end
        inputElement.setSelectionRange(validPart.length, validPart.length);
      }
    }
  }

  // Handle input change
  function handleInput(e: Event) {
    // Unlock speech on first user input (required for Chrome)
    unlockSpeech();
    
    const target = e.target as HTMLInputElement;
    
    // During composition (dead keys), keep userInput in sync but don't validate
    // This prevents Svelte's value binding from resetting the input
    if (isComposing) {
      userInput = target.value;
      return;
    }
    
    const newValue = target.value;
    
    // Special case: user typed space after completing the article - advance to singular
    if (isNoun && phase === 'article' && userInput === expectedInput && newValue === userInput + ' ') {
      // Add the article AND the space to completed segments
      completedSegments = [
        { text: userInput, colorClass: getGenderColorClass(nounGender) },
        { text: ' ' }
      ];
      // Clear input and advance to singular phase
      userInput = '';
      phase = 'singular';
      if (inputElement) {
        inputElement.value = '';
      }
      tick().then(() => {
        inputElement?.focus();
      });
      return;
    }
    
    validateInput(newValue);
  }

  // Handle key events
  function handleKeyDown(e: KeyboardEvent) {
    // Tab to auto-complete
    if (e.key === 'Tab') {
      e.preventDefault();
      autoComplete();
      return;
    }
    
    // Enter or Space to advance (when appropriate)
    if ((e.key === 'Enter' || e.key === ' ') && phase === 'complete') {
      e.preventDefault();
      onNext();
      return;
    }
    
    // Backspace to clear error (without removing valid input)
    if (e.key === 'Backspace' && hasError) {
      e.preventDefault(); // Don't let browser also remove a character
      hasError = false;
      errorChar = '';
    }
  }

  // Auto-complete current segment
  function autoComplete() {
    if (phase === 'complete') {
      onNext();
      return;
    }
    
    if (phase === 'translation') {
      showTranslation = true;
      advancePhase();
      return;
    }
    
    if (phase === 'example-target') {
      showTargetExample = true;
      // Speak the target language example sentence
      if (targetExample) {
        speakText(targetExample, targetLang, settings.audioEnabled);
      }
      advancePhase();
      return;
    }
    
    if (phase === 'example-base') {
      showBaseExample = true;
      advancePhase();
      return;
    }
    
    // Special handling for article phase: Tab should complete article AND advance to singular
    if (isNoun && phase === 'article') {
      // Add the article AND the space to completed segments
      completedSegments = [
        { text: expectedInput, colorClass: getGenderColorClass(nounGender) },
        { text: ' ' }
      ];
      userInput = '';
      phase = 'singular';
      if (inputElement) {
        inputElement.value = '';
      }
      tick().then(() => {
        inputElement?.focus();
      });
      return;
    }
    
    // Complete the current text input
    userInput = expectedInput;
    completeCurrentPhase();
  }

  // Complete the current phase and move to next
  function completeCurrentPhase() {
    // Add completed segment
    if (isNoun && nounData) {
      // Article phase is handled separately (waits for Space)
      if (phase === 'singular') {
        // Space was already added when transitioning from article phase
        // Now add the noun AND the ", " separator for plural
        completedSegments = [...completedSegments, 
          { text: userInput },
          { text: ', ' }
        ];
        userInput = '';
        phase = 'plural';
        // Clear input element value
        if (inputElement) {
          inputElement.value = '';
        }
      } else if (phase === 'plural') {
        // Comma was already added when transitioning from singular phase
        completedSegments = [...completedSegments,
          { text: userInput }
        ];
        userInput = '';
        phase = 'translation';
        
        // Speak the full noun phrase
        const article = getArticle(targetLang, nounGender);
        const fullPhrase = article ? `${article} ${nounData.word}. ${nounData.plural}.` : `${nounData.word}. ${nounData.plural}.`;
        speakText(fullPhrase, targetLang, settings.audioEnabled);
        
        // Record attempt
        const wordId = progressStore.getWordId(word);
        progressStore.recordAttempt(wordId, !hadAnyError);
        onComplete(!hadAnyError);
        
        // Auto-show translation
        setTimeout(() => {
          showTranslation = true;
          // Only advance if still in translation phase (user might have tab-completed ahead)
          if (phase === 'translation') {
            advancePhase();
          }
        }, 300);
      }
    } else if (verb && verbData) {
      if (phase === 'infinitive') {
        // Add the infinitive AND the separator for conjugation
        completedSegments = [...completedSegments, 
          { text: userInput },
          { text: getConjugationSeparator() }
        ];
        userInput = '';
        phase = 'conjugation';
        // Clear input element value
        if (inputElement) {
          inputElement.value = '';
        }
      } else if (phase === 'conjugation') {
        // Add the first conjugation AND the separator for conjugation2
        completedSegments = [...completedSegments,
          { text: userInput },
          { text: getConjugationSeparator2() }
        ];
        userInput = '';
        phase = 'conjugation2';
        // Clear input element value
        if (inputElement) {
          inputElement.value = '';
        }
      } else if (phase === 'conjugation2') {
        // For French, add separator and go to conjugation3 (passé composé)
        // For other languages, complete and go to translation
        if (targetLang === 'fr') {
          completedSegments = [...completedSegments,
            { text: userInput },
            { text: getConjugationSeparator3() }
          ];
          userInput = '';
          phase = 'conjugation3';
          // Clear input element value
          if (inputElement) {
            inputElement.value = '';
          }
        } else {
          // Add the second conjugation (perfekt/past form)
          completedSegments = [...completedSegments,
            { text: userInput }
          ];
          userInput = '';
          phase = 'translation';
          
          // Speak the full verb phrase with all three forms
          const conjugation1 = getVerbConjugation();
          const conjugation2 = getVerbConjugation2();
          const separator1 = getConjugationSeparator().trim();
          const separator2 = getConjugationSeparator2().trim();
          speakText(`${verbData.infinitive}${separator1} ${conjugation1}${separator2} ${conjugation2}`, targetLang, settings.audioEnabled);
          
          // Record attempt
          const wordId = progressStore.getWordId(word);
          progressStore.recordAttempt(wordId, !hadAnyError);
          onComplete(!hadAnyError);
          
          // Auto-show translation
          setTimeout(() => {
            showTranslation = true;
            // Only advance if still in translation phase (user might have tab-completed ahead)
            if (phase === 'translation') {
              advancePhase();
            }
          }, 300);
        }
      } else if (phase === 'conjugation3') {
        // Add the third conjugation (passé composé for French)
        completedSegments = [...completedSegments,
          { text: userInput }
        ];
        userInput = '';
        phase = 'translation';
        
        // Speak the full verb phrase with all four forms (for French)
        const conjugation1 = getVerbConjugation();
        const conjugation2 = getVerbConjugation2();
        const conjugation3 = getVerbConjugation3();
        const separator1 = getConjugationSeparator().trim();
        const separator2 = getConjugationSeparator2().trim();
        const separator3 = getConjugationSeparator3().trim();
        speakText(`${verbData.infinitive}${separator1} ${conjugation1}${separator2} ${conjugation2}${separator3} ${conjugation3}`, targetLang, settings.audioEnabled);
        
        // Record attempt
        const wordId = progressStore.getWordId(word);
        progressStore.recordAttempt(wordId, !hadAnyError);
        onComplete(!hadAnyError);
        
        // Auto-show translation
        setTimeout(() => {
          showTranslation = true;
          // Only advance if still in translation phase (user might have tab-completed ahead)
          if (phase === 'translation') {
            advancePhase();
          }
        }, 300);
      }
    }
    
    // Focus input for next segment
    tick().then(() => {
      inputElement?.focus();
    });
  }

  // Advance to next display phase
  function advancePhase() {
    if (phase === 'translation') {
      phase = 'example-target';
    } else if (phase === 'example-target') {
      phase = 'example-base';
    } else if (phase === 'example-base') {
      phase = 'complete';
    }
  }

  // Get the display word (what's shown at the top)
  const displayWord = $derived.by(() => {
    if (isNoun && nounData) {
      return nounData.word;
    } else if (verb && verbData) {
      return verbData.infinitive;
    }
    return '';
  });

  // Get translation in base language
  const translation = $derived.by(() => {
    if (isNoun && noun) {
      return noun.languages[baseLang].word;
    } else if (verb) {
      return verb.languages[baseLang].infinitive;
    }
    return '';
  });

  // Get example sentences
  const targetExample = $derived.by(() => {
    return word.examples[targetLang];
  });

  const baseExample = $derived.by(() => {
    return word.examples[baseLang];
  });

  // Highlight word in example sentence
  function highlightWord(sentence: string, wordToHighlight: string): string {
    // Simple replacement - could be improved for inflected forms
    const regex = new RegExp(`(${wordToHighlight})`, 'gi');
    return sentence.replace(regex, '<span class="word-highlight">$1</span>');
  }

  // Refocus the input when needed
  function refocusInput() {
    // Focus input during typing phases
    if (phase === 'article' || phase === 'singular' || phase === 'plural' || phase === 'definite' || 
        phase === 'infinitive' || phase === 'conjugation' || phase === 'conjugation2' || phase === 'conjugation3') {
      inputElement?.focus();
    }
    // Unlock speech on user interaction (required for Chrome)
    unlockSpeech();
  }

  // Check if a key is a printable character
  function isPrintableKey(key: string): boolean {
    // Exclude modifier keys, function keys, and special keys
    if (key.length === 1) {
      // Single character keys are usually printable
      return true;
    }
    // Allow some special keys that might be used for input
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    return allowedKeys.includes(key);
  }

  // Handle Control key for conjugation overlay
  function handleWindowKeyDown(e: KeyboardEvent) {
    // Auto-focus input when user starts typing (if in a typing phase)
    const isTypingPhase = phase === 'article' || phase === 'singular' || phase === 'plural' || phase === 'definite' || 
                          phase === 'infinitive' || phase === 'conjugation' || phase === 'conjugation2' || phase === 'conjugation3';
    
    if (isTypingPhase && inputElement && document.activeElement !== inputElement && isPrintableKey(e.key)) {
      // Focus the input so typing works immediately
      inputElement.focus();
      // Don't prevent default - let the character be typed
    }
    
    // Show conjugation overlay when Control is pressed (for verbs only)
    if (e.key === 'Control' && !isNoun && verb) {
      e.preventDefault();
      showConjugationOverlay = true;
    }
    
    // Handle Tab key when input is hidden (for example phases)
    if (e.key === 'Tab' && (phase === 'translation' || phase === 'example-target' || phase === 'example-base')) {
      e.preventDefault();
      autoComplete();
    }
    // Handle Enter/Space to go to next word when complete
    if ((e.key === 'Enter' || e.key === ' ') && phase === 'complete') {
      e.preventDefault();
      onNext();
    }
  }

  function handleWindowKeyUp(e: KeyboardEvent) {
    // Hide conjugation overlay when Control is released
    if (e.key === 'Control') {
      showConjugationOverlay = false;
      // Refocus input after overlay closes
      tick().then(() => {
        inputElement?.focus();
      });
    }
  }

  // Types for conjugation table sections
  interface ConjugationSection {
    title: string;
    headers: string[];
    rows: { person: string; forms: string[] }[];
  }

  // Get full conjugation table data for the current verb and target language
  function getConjugationTableData(): ConjugationSection[] | null {
    if (!verb) return null;

    switch (targetLang) {
      case 'de': {
        const v = verb.languages.de;
        return [
          {
            title: 'Indikativ',
            headers: ['Präsens', 'Präteritum', 'Futur I', 'Perfekt', 'Plusquamperf.', 'Futur II'],
            rows: [
              { person: 'ich', forms: [v.indicative.präsens.ich, v.indicative.präteritum.ich, v.indicative.futurI.ich, v.indicative.perfekt.conjugation.ich, v.indicative.plusquamperfekt.conjugation.ich, v.indicative.futurII.conjugation.ich] },
              { person: 'du', forms: [v.indicative.präsens.du, v.indicative.präteritum.du, v.indicative.futurI.du, v.indicative.perfekt.conjugation.du, v.indicative.plusquamperfekt.conjugation.du, v.indicative.futurII.conjugation.du] },
              { person: 'er/sie/es', forms: [v.indicative.präsens['er/sie/es'], v.indicative.präteritum['er/sie/es'], v.indicative.futurI['er/sie/es'], v.indicative.perfekt.conjugation['er/sie/es'], v.indicative.plusquamperfekt.conjugation['er/sie/es'], v.indicative.futurII.conjugation['er/sie/es']] },
              { person: 'wir', forms: [v.indicative.präsens.wir, v.indicative.präteritum.wir, v.indicative.futurI.wir, v.indicative.perfekt.conjugation.wir, v.indicative.plusquamperfekt.conjugation.wir, v.indicative.futurII.conjugation.wir] },
              { person: 'ihr', forms: [v.indicative.präsens.ihr, v.indicative.präteritum.ihr, v.indicative.futurI.ihr, v.indicative.perfekt.conjugation.ihr, v.indicative.plusquamperfekt.conjugation.ihr, v.indicative.futurII.conjugation.ihr] },
              { person: 'sie/Sie', forms: [v.indicative.präsens.sie, v.indicative.präteritum.sie, v.indicative.futurI.sie, v.indicative.perfekt.conjugation.sie, v.indicative.plusquamperfekt.conjugation.sie, v.indicative.futurII.conjugation.sie] },
            ]
          },
          {
            title: 'Imperativ',
            headers: ['Form'],
            rows: [
              { person: 'du', forms: [v.imperativ.du] },
              { person: 'ihr', forms: [v.imperativ.ihr] },
              { person: 'Sie', forms: [v.imperativ.Sie] },
            ]
          }
        ];
      }
      case 'fr': {
        const v = verb.languages.fr;
        return [
          {
            title: 'Indicatif',
            headers: ['Présent', 'Imparfait', 'Passé simple', 'Futur simple'],
            rows: [
              { person: 'je', forms: [v.indicative.présent.je, v.indicative.imparfait.je, v.indicative.passéSimple.je, v.indicative.futurSimple.je] },
              { person: 'tu', forms: [v.indicative.présent.tu, v.indicative.imparfait.tu, v.indicative.passéSimple.tu, v.indicative.futurSimple.tu] },
              { person: 'il/elle', forms: [v.indicative.présent['il/elle'], v.indicative.imparfait['il/elle'], v.indicative.passéSimple['il/elle'], v.indicative.futurSimple['il/elle']] },
              { person: 'nous', forms: [v.indicative.présent.nous, v.indicative.imparfait.nous, v.indicative.passéSimple.nous, v.indicative.futurSimple.nous] },
              { person: 'vous', forms: [v.indicative.présent.vous, v.indicative.imparfait.vous, v.indicative.passéSimple.vous, v.indicative.futurSimple.vous] },
              { person: 'ils/elles', forms: [v.indicative.présent['ils/elles'], v.indicative.imparfait['ils/elles'], v.indicative.passéSimple['ils/elles'], v.indicative.futurSimple['ils/elles']] },
            ]
          },
          {
            title: 'Temps composés',
            headers: ['Passé composé', 'Plus-que-parfait', 'Futur antérieur'],
            rows: [
              { person: 'je', forms: [v.indicative.passéComposé.conjugation.je, v.indicative.plusQueParfait.conjugation.je, v.indicative.futurAntérieur.conjugation.je] },
              { person: 'tu', forms: [v.indicative.passéComposé.conjugation.tu, v.indicative.plusQueParfait.conjugation.tu, v.indicative.futurAntérieur.conjugation.tu] },
              { person: 'il/elle', forms: [v.indicative.passéComposé.conjugation['il/elle'], v.indicative.plusQueParfait.conjugation['il/elle'], v.indicative.futurAntérieur.conjugation['il/elle']] },
              { person: 'nous', forms: [v.indicative.passéComposé.conjugation.nous, v.indicative.plusQueParfait.conjugation.nous, v.indicative.futurAntérieur.conjugation.nous] },
              { person: 'vous', forms: [v.indicative.passéComposé.conjugation.vous, v.indicative.plusQueParfait.conjugation.vous, v.indicative.futurAntérieur.conjugation.vous] },
              { person: 'ils/elles', forms: [v.indicative.passéComposé.conjugation['ils/elles'], v.indicative.plusQueParfait.conjugation['ils/elles'], v.indicative.futurAntérieur.conjugation['ils/elles']] },
            ]
          },
          {
            title: 'Impératif',
            headers: ['Form'],
            rows: [
              { person: 'tu', forms: [v.impératif.tu] },
              { person: 'nous', forms: [v.impératif.nous] },
              { person: 'vous', forms: [v.impératif.vous] },
            ]
          }
        ];
      }
      case 'es': {
        const v = verb.languages.es;
        return [
          {
            title: 'Indicativo (tiempos simples)',
            headers: ['Presente', 'Pret. imperfecto', 'Pret. indefinido', 'Futuro simple'],
            rows: [
              { person: 'yo', forms: [v.indicative.presente.yo, v.indicative.pretéritoImperfecto.yo, v.indicative.pretéritoIndefinido.yo, v.indicative.futuroSimple.yo] },
              { person: 'tú', forms: [v.indicative.presente.tú, v.indicative.pretéritoImperfecto.tú, v.indicative.pretéritoIndefinido.tú, v.indicative.futuroSimple.tú] },
              { person: 'él/ella', forms: [v.indicative.presente['él/ella/usted'], v.indicative.pretéritoImperfecto['él/ella/usted'], v.indicative.pretéritoIndefinido['él/ella/usted'], v.indicative.futuroSimple['él/ella/usted']] },
              { person: 'nosotros', forms: [v.indicative.presente.nosotros, v.indicative.pretéritoImperfecto.nosotros, v.indicative.pretéritoIndefinido.nosotros, v.indicative.futuroSimple.nosotros] },
              { person: 'vosotros', forms: [v.indicative.presente.vosotros, v.indicative.pretéritoImperfecto.vosotros, v.indicative.pretéritoIndefinido.vosotros, v.indicative.futuroSimple.vosotros] },
              { person: 'ellos', forms: [v.indicative.presente['ellos/ellas/ustedes'], v.indicative.pretéritoImperfecto['ellos/ellas/ustedes'], v.indicative.pretéritoIndefinido['ellos/ellas/ustedes'], v.indicative.futuroSimple['ellos/ellas/ustedes']] },
            ]
          },
          {
            title: 'Indicativo (tiempos compuestos)',
            headers: ['Pret. perfecto', 'Pret. pluscuamperf.', 'Futuro perfecto'],
            rows: [
              { person: 'yo', forms: [v.indicative.pretéritoPerfecto.conjugation.yo, v.indicative.pretéritoPluscuamperfecto.conjugation.yo, v.indicative.futuroPerfecto.conjugation.yo] },
              { person: 'tú', forms: [v.indicative.pretéritoPerfecto.conjugation.tú, v.indicative.pretéritoPluscuamperfecto.conjugation.tú, v.indicative.futuroPerfecto.conjugation.tú] },
              { person: 'él/ella', forms: [v.indicative.pretéritoPerfecto.conjugation['él/ella/usted'], v.indicative.pretéritoPluscuamperfecto.conjugation['él/ella/usted'], v.indicative.futuroPerfecto.conjugation['él/ella/usted']] },
              { person: 'nosotros', forms: [v.indicative.pretéritoPerfecto.conjugation.nosotros, v.indicative.pretéritoPluscuamperfecto.conjugation.nosotros, v.indicative.futuroPerfecto.conjugation.nosotros] },
              { person: 'vosotros', forms: [v.indicative.pretéritoPerfecto.conjugation.vosotros, v.indicative.pretéritoPluscuamperfecto.conjugation.vosotros, v.indicative.futuroPerfecto.conjugation.vosotros] },
              { person: 'ellos', forms: [v.indicative.pretéritoPerfecto.conjugation['ellos/ellas/ustedes'], v.indicative.pretéritoPluscuamperfecto.conjugation['ellos/ellas/ustedes'], v.indicative.futuroPerfecto.conjugation['ellos/ellas/ustedes']] },
            ]
          },
          {
            title: 'Imperativo',
            headers: ['Positivo', 'Negativo'],
            rows: [
              { person: 'tú', forms: [v.imperativo.positivo.tú, v.imperativo.negativo.tú] },
              { person: 'vosotros', forms: [v.imperativo.positivo.vosotros, v.imperativo.negativo.vosotros] },
              { person: 'usted', forms: [v.imperativo.positivo.usted, v.imperativo.negativo.usted] },
              { person: 'ustedes', forms: [v.imperativo.positivo.ustedes, v.imperativo.negativo.ustedes] },
            ]
          }
        ];
      }
      case 'no': {
        const v = verb.languages.no;
        return [
          {
            title: 'Bøyning',
            headers: ['Form'],
            rows: [
              { person: 'Infinitiv', forms: [v.infinitive] },
              { person: 'Presens', forms: [v.presens] },
              { person: 'Preteritum', forms: [v.preteritum] },
              { person: 'Perfektum', forms: [`${v.perfektum.auxiliary} ${v.perfektum.partisipp}`] },
              { person: 'Pluskvamperfektum', forms: [`${v.pluskvamperfektum.auxiliary} ${v.pluskvamperfektum.partisipp}`] },
              { person: 'Futurum', forms: [v.futurum] },
              { person: 'Imperativ', forms: [v.imperativ] },
            ]
          }
        ];
      }
      case 'en': {
        const v = verb.languages.en;
        return [
          {
            title: 'Forms',
            headers: ['Form'],
            rows: [
              { person: 'Infinitive', forms: [v.infinitive] },
              { person: '3rd person singular', forms: [v.thirdPersonSingular] },
              { person: 'Simple past', forms: [v.simplePast] },
              { person: 'Past participle', forms: [v.pastParticiple] },
              { person: 'Present participle', forms: [v.presentParticiple] },
            ]
          }
        ];
      }
      default:
        return null;
    }
  }

  const conjugationSections = $derived(getConjugationTableData());

  onMount(() => {
    inputElement?.focus();
  });
</script>

<svelte:window 
  onkeydown={handleWindowKeyDown}
  onkeyup={handleWindowKeyUp}
  onfocus={refocusInput}
  onvisibilitychange={() => {
    // Refocus when tab becomes visible again
    if (document.visibilityState === 'visible') {
      refocusInput();
    }
  }}
/>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="drill-container" onclick={refocusInput}>
  <!-- Word display -->
  <div class="word-display">
    <span class="word-type">{isNoun ? 'noun' : 'verb'}</span>
    <h1 class="word">{displayWord}</h1>
  </div>

  <!-- Conjugation overlay (shown when Control is held for verbs) -->
  {#if showConjugationOverlay && conjugationSections}
    <div class="conjugation-overlay animate-fade-in">
      <div class="conjugation-card">
        <h3 class="conjugation-title">{displayWord}</h3>
        <div class="conjugation-sections">
          {#each conjugationSections as section}
            <div class="conjugation-section">
              <h4 class="section-title">{section.title}</h4>
              <div class="conjugation-table-wrapper">
                <table class="conjugation-table">
                  <thead>
                    <tr>
                      <th></th>
                      {#each section.headers as header}
                        <th>{header}</th>
                      {/each}
                    </tr>
                  </thead>
                  <tbody>
                    {#each section.rows as row}
                      <tr>
                        <td class="person">{row.person}</td>
                        {#each row.forms as form}
                          <td>{form}</td>
                        {/each}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/each}
        </div>
        <p class="conjugation-hint">
          {#if isMobile}
            <button type="button" class="conjugation-close-btn" onclick={toggleConjugationOverlay}>Close</button>
          {:else}
            Release <kbd>{modifierKeyName}</kbd> to close
          {/if}
        </p>
      </div>
    </div>
  {/if}

  <!-- Input area -->
  <div class="input-area">
    <!-- Completed segments -->
    <div class="completed-text">
      {#each completedSegments as segment}
        <span class={segment.colorClass || ''}>{segment.text}</span>
      {/each}
      
      <!-- Current input display (for visual feedback) -->
      {#if phase === 'article' || phase === 'singular' || phase === 'plural' || phase === 'definite' || phase === 'infinitive' || phase === 'conjugation' || phase === 'conjugation2' || phase === 'conjugation3'}
        <span class="current-input">{userInput}{#if hasError}<span class="error-char">{errorChar}</span>{/if}<span class="cursor">|</span></span>
      {/if}
    </div>

    <!-- Hidden input for keyboard capture -->
    {#if phase === 'article' || phase === 'singular' || phase === 'plural' || phase === 'definite' || phase === 'infinitive' || phase === 'conjugation' || phase === 'conjugation2' || phase === 'conjugation3'}
      <input
        bind:this={inputElement}
        type="text"
        value={userInput}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        oncompositionstart={handleCompositionStart}
        oncompositionend={handleCompositionEnd}
        class="hidden-input"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        tabindex="0"
      />
    {:else}
      <!-- Invisible input to capture Tab key during example phases -->
      <input
        type="text"
        onkeydown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            autoComplete();
          }
        }}
        class="hidden-input"
        tabindex="0"
        autocomplete="off"
      />
    {/if}

    <!-- Hint text -->
    {#if phase !== 'complete'}
      <p class="hint">
        {#if phase === 'article'}
          Type the article and noun
        {:else if phase === 'singular'}
          Type the noun
        {:else if phase === 'plural'}
          Type the plural form
        {:else if phase === 'infinitive'}
          Type the infinitive
        {:else if phase === 'conjugation'}
          Type the {getConjugationLabel()}
        {:else if phase === 'conjugation2'}
          Type the {getConjugationLabel2()}
        {:else if phase === 'conjugation3'}
          Type the {getConjugationLabel3()}
        {:else if phase === 'translation' || phase === 'example-target' || phase === 'example-base'}
          Press <kbd>Tab</kbd> to reveal
        {/if}
        {#if phase !== 'translation' && phase !== 'example-target' && phase !== 'example-base'}
          • <kbd>Tab</kbd> to auto-complete
        {/if}
        {#if !isNoun && (phase === 'infinitive' || phase === 'conjugation' || phase === 'conjugation2' || phase === 'conjugation3')}
          {#if isMobile}
            • <button type="button" class="conjugation-toggle-btn" onclick={toggleConjugationOverlay}>View conjugation</button>
          {:else}
            • <kbd>{modifierKeyName}</kbd> to see conjugation
          {/if}
        {/if}
      </p>
    {/if}
  </div>

  <!-- Translation -->
  {#if showTranslation}
    <div class="translation animate-fade-in">
      <span class="label">Translation:</span>
      <span class="value">{translation}</span>
    </div>
  {/if}

  <!-- Target language example -->
  {#if showTargetExample && targetExample}
    <div class="example animate-fade-in">
      <span class="label">Example:</span>
      <p class="target">{@html highlightWord(targetExample, displayWord)}</p>
    </div>
  {/if}

  <!-- Base language example -->
  {#if showBaseExample && baseExample}
    <div class="example animate-fade-in">
      <p class="base">{@html highlightWord(baseExample, translation)}</p>
    </div>
  {/if}

  <!-- Next button -->
  {#if phase === 'complete'}
    <button 
      class="next-button animate-fade-in" 
      onclick={() => onNext()}
    >
      Next Word
      <span class="shortcut">Enter / Space</span>
    </button>
  {/if}
</div>

<style>
  .drill-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-lg);
    position: relative;
  }

  .word-display {
    text-align: center;
  }

  .word-type {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    background: var(--color-bg-elevated);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-sm);
  }

  .word {
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text);
  }

  .input-area {
    width: 100%;
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .completed-text {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 500;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: baseline;
    gap: 0;
    min-height: 2rem;
    white-space: pre;
  }

  .current-input {
    position: relative;
  }

  .cursor {
    animation: pulse 1s ease-in-out infinite;
    color: var(--color-accent);
  }

  .error-char {
    color: var(--color-error);
    text-decoration: line-through;
  }

  .hidden-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 1px;
    height: 1px;
  }

  .hint {
    margin-top: var(--space-lg);
    font-size: 0.875rem;
    color: var(--color-text-dim);
    text-align: center;
  }

  .hint kbd {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    background: var(--color-bg);
    border: 1px solid var(--color-text-dim);
    border-radius: var(--radius-sm);
    margin: 0 0.125rem;
  }

  .translation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .translation .label,
  .example .label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-dim);
  }

  .translation .value {
    font-size: 1.25rem;
    color: var(--color-text);
  }

  .example {
    text-align: center;
  }

  .example .target {
    font-size: 1.125rem;
    color: var(--color-text);
    font-style: italic;
  }

  .example .base {
    font-size: 1rem;
    color: var(--color-text-muted);
  }

  .next-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    background: var(--color-accent);
    color: var(--color-bg);
    padding: var(--space-md) var(--space-2xl);
    border-radius: var(--radius-lg);
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .next-button:hover {
    background: #d4a520;
    transform: translateY(-2px);
  }

  .next-button .shortcut {
    font-size: 0.75rem;
    font-weight: 400;
    opacity: 0.7;
  }

  /* Gender colors */
  :global(.text-masculine) { color: var(--color-masculine); }
  :global(.text-feminine) { color: var(--color-feminine); }
  :global(.text-neuter) { color: var(--color-neuter); }

  /* Conjugation overlay */
  .conjugation-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-lg);
  }

  .conjugation-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-width: 100%;
    max-height: 80vh;
    overflow: auto;
    box-shadow: var(--shadow-lg);
  }

  .conjugation-title {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: var(--space-lg);
    color: var(--color-accent);
  }

  .conjugation-sections {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .conjugation-section {
    border-top: 1px solid var(--color-bg-elevated);
    padding-top: var(--space-md);
  }

  .conjugation-section:first-child {
    border-top: none;
    padding-top: 0;
  }

  .section-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
  }

  .conjugation-table-wrapper {
    overflow-x: auto;
  }

  .conjugation-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .conjugation-table th,
  .conjugation-table td {
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    border-bottom: 1px solid var(--color-bg-elevated);
  }

  .conjugation-table th {
    font-weight: 600;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .conjugation-table td {
    color: var(--color-text);
  }

  .conjugation-table .person {
    font-weight: 600;
    color: var(--color-accent);
    white-space: nowrap;
  }

  .conjugation-table tr:last-child td {
    border-bottom: none;
  }

  .conjugation-hint {
    text-align: center;
    margin-top: var(--space-lg);
    font-size: 0.75rem;
    color: var(--color-text-dim);
  }

  .conjugation-hint kbd {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    background: var(--color-bg);
    border: 1px solid var(--color-text-dim);
    border-radius: var(--radius-sm);
    margin: 0 0.125rem;
  }

  .conjugation-toggle-btn,
  .conjugation-close-btn {
    display: inline-block;
    padding: var(--space-xs) var(--space-md);
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    margin-left: var(--space-xs);
  }

  .conjugation-toggle-btn:hover,
  .conjugation-close-btn:hover {
    background: #d4a520;
    transform: translateY(-1px);
  }

  .conjugation-toggle-btn:active,
  .conjugation-close-btn:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    .word {
      font-size: 2.5rem;
    }

    .completed-text {
      font-size: 1.25rem;
    }

    .input-area {
      padding: var(--space-lg);
    }

    .conjugation-table {
      font-size: 0.8rem;
    }

    .conjugation-table th,
    .conjugation-table td {
      padding: var(--space-xs) var(--space-sm);
    }
  }
</style>
