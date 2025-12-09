<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { NounData, VerbData, VocabularyItem, Gender } from '$lib/data/vocabulary';
  import { getArticle } from '$lib/data/vocabulary';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { progressStore } from '$lib/stores/progress.svelte';
  import { speakGerman } from '$lib/utils/speech';
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
  let showGermanExample = $state(false);
  let showBaseExample = $state(false);

  // Derived values
  const isNoun = $derived(word.type === 'noun');
  const noun = $derived(isNoun ? word as NounData : null);
  const verb = $derived(!isNoun ? word as VerbData : null);
  const settings = $derived(settingsStore.value);

  // Get what the user should type next
  const expectedInput = $derived.by(() => {
    if (isNoun && noun) {
      switch (phase) {
        case 'article': return getArticle(noun.gender);
        case 'singular': return noun.german;
        case 'plural': return noun.plural;
        default: return '';
      }
    } else if (verb) {
      switch (phase) {
        case 'infinitive': return verb.infinitive;
        case 'conjugation': return `du ${verb.conjugations.präsens.du}`;
        default: return '';
      }
    }
    return '';
  });

  // Get color class for article based on gender
  function getGenderColorClass(gender: Gender): string {
    switch (gender) {
      case 'masculine': return 'text-masculine';
      case 'feminine': return 'text-feminine';
      case 'neuter': return 'text-neuter';
    }
  }

  // Reset state when word changes
  $effect(() => {
    // Trigger on word change
    word;
    
    // Reset all state
    phase = isNoun ? 'article' : 'infinitive';
    userInput = '';
    hasError = false;
    errorChar = '';
    completedSegments = [];
    hadAnyError = false;
    articleComplete = false;
    showTranslation = false;
    showGermanExample = false;
    showBaseExample = false;
    
    // Focus input
    tick().then(() => {
      inputElement?.focus();
    });
  });

  // Track if article is complete (for nouns, we wait for Space)
  let articleComplete = $state(false);

  // Handle input change
  function handleInput(e: Event) {
    // If article is complete, don't allow typing until Space is pressed
    if (isNoun && phase === 'article' && articleComplete) {
      e.preventDefault();
      if (inputElement) {
        inputElement.value = '';
      }
      return;
    }
    
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    
    // Check each character
    if (newValue.length > userInput.length) {
      const newChar = newValue[newValue.length - 1];
      const expectedChar = expectedInput[newValue.length - 1];
      
      if (newChar !== expectedChar) {
        hasError = true;
        errorChar = newChar;
        hadAnyError = true;
        
        // Play error animation
        inputElement?.classList.add('animate-shake');
        setTimeout(() => {
          inputElement?.classList.remove('animate-shake');
        }, 300);
        
        return; // Don't update input
      }
    }
    
    hasError = false;
    errorChar = '';
    userInput = newValue;
    
    // Check if segment is complete
    if (userInput === expectedInput) {
      // For nouns in article phase, wait for Space before advancing
      if (isNoun && phase === 'article') {
        articleComplete = true;
        // Add to completed segments with color
        completedSegments = [{ 
          text: userInput, 
          colorClass: noun ? getGenderColorClass(noun.gender) : '' 
        }];
        // Clear input but stay in article phase until Space is pressed
        userInput = '';
        if (inputElement) {
          inputElement.value = '';
        }
      } else {
        // For other phases, auto-advance
        completeCurrentPhase();
      }
    }
  }

  // Handle key events
  function handleKeyDown(e: KeyboardEvent) {
    // Tab to auto-complete
    if (e.key === 'Tab') {
      e.preventDefault();
      autoComplete();
      return;
    }
    
    // Space to advance after completing article (for nouns)
    if (e.key === ' ' && isNoun && phase === 'article' && articleComplete) {
      e.preventDefault();
      // Move to singular phase
      phase = 'singular';
      articleComplete = false;
      // Clear input and focus
      userInput = '';
      if (inputElement) {
        inputElement.value = '';
      }
      tick().then(() => {
        inputElement?.focus();
      });
      return;
    }
    
    // Enter or Space to advance (when appropriate)
    if ((e.key === 'Enter' || e.key === ' ') && phase === 'complete') {
      e.preventDefault();
      onNext();
      return;
    }
    
    // Backspace to clear error
    if (e.key === 'Backspace' && hasError) {
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
    
    if (phase === 'example-german') {
      showGermanExample = true;
      advancePhase();
      return;
    }
    
    if (phase === 'example-base') {
      showBaseExample = true;
      advancePhase();
      return;
    }
    
    // Complete the current text input
    userInput = expectedInput;
    completeCurrentPhase();
  }

  // Complete the current phase and move to next
  function completeCurrentPhase() {
    // Add completed segment
    if (isNoun && noun) {
      // Article phase is handled separately (waits for Space)
      if (phase === 'singular') {
        completedSegments = [...completedSegments, 
          { text: ' ' },
          { text: userInput }
        ];
        userInput = '';
        phase = 'plural';
        // Clear input element value
        if (inputElement) {
          inputElement.value = '';
        }
      } else if (phase === 'plural') {
        completedSegments = [...completedSegments,
          { text: ', ' },
          { text: userInput }
        ];
        userInput = '';
        phase = 'translation';
        
        // Speak the word
        speakGerman(`${getArticle(noun.gender)} ${noun.german}`, settings.audioEnabled);
        
        // Record attempt
        const wordId = progressStore.getWordId(word);
        progressStore.recordAttempt(wordId, !hadAnyError);
        onComplete(!hadAnyError);
        
        // Auto-show translation
        setTimeout(() => {
          showTranslation = true;
          advancePhase();
        }, 300);
      }
    } else if (verb) {
      if (phase === 'infinitive') {
        completedSegments = [...completedSegments, { text: userInput }];
        userInput = '';
        phase = 'conjugation';
        // Clear input element value
        if (inputElement) {
          inputElement.value = '';
        }
      } else if (phase === 'conjugation') {
        completedSegments = [...completedSegments,
          { text: ', ' },
          { text: userInput }
        ];
        userInput = '';
        phase = 'translation';
        
        // Speak the verb
        speakGerman(verb.infinitive, settings.audioEnabled);
        
        // Record attempt
        const wordId = progressStore.getWordId(word);
        progressStore.recordAttempt(wordId, !hadAnyError);
        onComplete(!hadAnyError);
        
        // Auto-show translation
        setTimeout(() => {
          showTranslation = true;
          advancePhase();
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
      phase = 'example-german';
    } else if (phase === 'example-german') {
      phase = 'example-base';
    } else if (phase === 'example-base') {
      phase = 'complete';
    }
  }

  // Get the display word (what's shown at the top)
  const displayWord = $derived.by(() => {
    if (isNoun && noun) {
      return noun.german;
    } else if (verb) {
      return verb.infinitive;
    }
    return '';
  });

  // Get translation in current base language
  const translation = $derived.by(() => {
    if (isNoun && noun) {
      return noun.translations[settings.baseLanguage];
    } else if (verb) {
      return verb.translations[settings.baseLanguage];
    }
    return '';
  });

  // Get example sentences
  const germanExample = $derived.by(() => {
    return isNoun ? noun?.examples.german : verb?.examples.german;
  });

  const baseExample = $derived.by(() => {
    if (isNoun && noun) {
      return noun.examples[settings.baseLanguage];
    } else if (verb) {
      return verb.examples[settings.baseLanguage];
    }
    return '';
  });

  // Highlight word in example sentence
  function highlightWord(sentence: string, wordToHighlight: string): string {
    // Simple replacement - could be improved for inflected forms
    const regex = new RegExp(`(${wordToHighlight})`, 'gi');
    return sentence.replace(regex, '<span class="word-highlight">$1</span>');
  }

  onMount(() => {
    inputElement?.focus();
  });
</script>

<div class="drill-container" onkeydown={(e) => {
  // Handle Tab key when input is hidden (for example phases)
  if (e.key === 'Tab' && (phase === 'translation' || phase === 'example-german' || phase === 'example-base')) {
    e.preventDefault();
    autoComplete();
  }
}}>
  <!-- Word display -->
  <div class="word-display">
    <span class="word-type">{isNoun ? 'noun' : 'verb'}</span>
    <h1 class="word">{displayWord}</h1>
  </div>

  <!-- Input area -->
  <div class="input-area">
    <!-- Completed segments -->
    <div class="completed-text">
      {#each completedSegments as segment}
        <span class={segment.colorClass || ''}>{segment.text}</span>
      {/each}
      
      <!-- Current input display (for visual feedback) -->
      {#if phase !== 'translation' && phase !== 'example-german' && phase !== 'example-base' && phase !== 'complete'}
        <span class="current-input">
          {#if isNoun && phase === 'article' && articleComplete}
            <!-- Show hint to press Space -->
            <span class="space-hint">Press Space</span>
          {:else}
            {userInput}
            {#if hasError}
              <span class="error-char">{errorChar}</span>
            {/if}
            <span class="cursor">|</span>
          {/if}
        </span>
      {/if}
    </div>

    <!-- Hidden input for keyboard capture -->
    {#if phase !== 'translation' && phase !== 'example-german' && phase !== 'example-base' && phase !== 'complete'}
      <input
        bind:this={inputElement}
        type="text"
        value={userInput}
        oninput={handleInput}
        onkeydown={handleKeyDown}
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
          {#if articleComplete}
            Press <kbd>Space</kbd> to continue
          {:else}
            Type the definite article (der/die/das)
          {/if}
        {:else if phase === 'singular'}
          Type the noun
        {:else if phase === 'plural'}
          Type the plural form
        {:else if phase === 'infinitive'}
          Type the infinitive
        {:else if phase === 'conjugation'}
          Type "du" + conjugated form
        {:else if phase === 'translation' || phase === 'example-german' || phase === 'example-base'}
          Press <kbd>Tab</kbd> to reveal
        {/if}
        {#if phase !== 'translation' && phase !== 'example-german' && phase !== 'example-base'}
          • <kbd>Tab</kbd> to auto-complete
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

  <!-- German example -->
  {#if showGermanExample && germanExample}
    <div class="example animate-fade-in">
      <span class="label">Example:</span>
      <p class="german">{@html highlightWord(germanExample, displayWord)}</p>
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

  .space-hint {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    font-style: italic;
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

  .example .german {
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
  }
</style>

