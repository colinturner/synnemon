// Web Speech API for text-to-speech in multiple languages
// This is free and built into modern browsers

import type { Language } from '$lib/data/vocabulary';

// Track if speech has been unlocked by user interaction
let speechUnlocked = false;

// Cache voices by language (only stores actual voices, not null)
const cachedVoices: Partial<Record<Language, SpeechSynthesisVoice>> = {};

// Track if voices have been loaded
let voicesLoaded = false;

// Get all language tag variants to try for a language
function getLanguageTagVariants(lang: Language): string[] {
  switch (lang) {
    case 'de': return ['de-DE', 'de-AT', 'de-CH', 'de'];
    case 'fr': return ['fr-FR', 'fr-CA', 'fr-BE', 'fr'];
    case 'es': return ['es-ES', 'es-MX', 'es-AR', 'es'];
    case 'no': return ['nb-NO', 'no-NO', 'nn-NO', 'nb', 'no', 'nn']; // Norwegian has many variants
    case 'en': return ['en-US', 'en-GB', 'en-AU', 'en'];
    default: return ['en-US'];
  }
}

// Initialize voices and set up listener for when they change
function initVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  
  const synth = window.speechSynthesis;
  
  // Clear cache when voices change (e.g., new voices become available)
  synth.onvoiceschanged = () => {
    // Clear cache so we re-fetch voices
    Object.keys(cachedVoices).forEach(key => {
      delete cachedVoices[key as Language];
    });
    voicesLoaded = true;
    console.log('[Speech] Voices changed, cache cleared. Available voices:', synth.getVoices().length);
  };
  
  // Check if voices are already available
  const voices = synth.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
  }
}

// Call this on first user interaction to unlock speech in Chrome
export function unlockSpeech(): void {
  if (speechUnlocked) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  
  // Initialize voice loading
  initVoices();
  
  // Speak an empty utterance to unlock
  const utterance = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(utterance);
  speechUnlocked = true;
  console.log('[Speech] Unlocked');
}

// Find the best voice for a language
function findVoice(lang: Language): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  
  // Check cache first (only contains actual voices, not null)
  if (cachedVoices[lang]) {
    return cachedVoices[lang];
  }
  
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    console.log('[Speech] No voices available yet');
    return null;
  }
  
  const langVariants = getLanguageTagVariants(lang);
  
  // Try each language variant in order of preference
  for (const langTag of langVariants) {
    // Try exact match first
    let voice = voices.find(v => v.lang === langTag);
    if (voice) {
      cachedVoices[lang] = voice;
      console.log(`[Speech] Found voice for ${lang}: ${voice.name} (${voice.lang})`);
      return voice;
    }
    
    // Try prefix match (e.g., 'de' matches 'de-DE')
    voice = voices.find(v => v.lang.startsWith(langTag.split('-')[0] + '-'));
    if (voice) {
      cachedVoices[lang] = voice;
      console.log(`[Speech] Found voice for ${lang} (prefix match): ${voice.name} (${voice.lang})`);
      return voice;
    }
  }
  
  // Last resort: try to find any voice that starts with the language code
  const langCode = langVariants[0].split('-')[0];
  const fallbackVoice = voices.find(v => v.lang.toLowerCase().startsWith(langCode));
  if (fallbackVoice) {
    cachedVoices[lang] = fallbackVoice;
    console.log(`[Speech] Found fallback voice for ${lang}: ${fallbackVoice.name} (${fallbackVoice.lang})`);
    return fallbackVoice;
  }
  
  console.log(`[Speech] No voice found for ${lang}. Available voices:`, voices.map(v => `${v.name} (${v.lang})`).join(', '));
  // Don't cache null - we'll try again next time
  return null;
}

// Speak text in the specified language
export function speakText(text: string, lang: Language, enabled: boolean = true): void {
  if (!enabled) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find and set voice for the language
  const voice = findVoice(lang);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang; // Use the voice's actual language tag
  } else {
    // Fallback: set language tag directly (browser will try to use appropriate voice)
    const langVariants = getLanguageTagVariants(lang);
    utterance.lang = langVariants[0];
  }
  
  utterance.rate = 0.9;
  utterance.pitch = 1;

  // Cancel any ongoing speech before starting new one (Chrome fix)
  synth.cancel();
  
  // Speak
  synth.speak(utterance);
}

// Legacy function for backward compatibility
export function speakGerman(text: string, enabled: boolean = true): void {
  speakText(text, 'de', enabled);
}

// Load voices (they may not be immediately available)
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    // Voices might load asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      resolve(window.speechSynthesis.getVoices());
    };

    // Fallback timeout
    setTimeout(() => {
      voicesLoaded = true;
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}
