import { browser } from '$app/environment';
import type { AppSettings } from '$lib/types';
import type { Language } from '$lib/data/vocabulary';

const SETTINGS_KEY = 'language-drills-settings';

const defaultSettings: AppSettings = {
  baseLanguage: 'en',
  targetLanguage: 'de',
  fullConjugationMode: false,
  audioEnabled: true,
  wordTypes: 'both'
};

function loadSettings(): AppSettings {
  if (!browser) return defaultSettings;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old settings that don't have targetLanguage
      if (!parsed.targetLanguage) {
        parsed.targetLanguage = 'de';
      }
      // Migrate old settings that don't have wordTypes
      if (!parsed.wordTypes) {
        parsed.wordTypes = 'both';
      }
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: AppSettings) {
  if (!browser) return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Create reactive settings store using Svelte 5 runes
function createSettingsStore() {
  let settings = $state<AppSettings>(loadSettings());

  return {
    get value() {
      return settings;
    },
    
    setBaseLanguage(lang: Language) {
      // Don't allow base and target to be the same
      if (lang === settings.targetLanguage) {
        return;
      }
      settings = { ...settings, baseLanguage: lang };
      saveSettings(settings);
    },
    
    setTargetLanguage(lang: Language) {
      // Don't allow base and target to be the same
      if (lang === settings.baseLanguage) {
        return;
      }
      settings = { ...settings, targetLanguage: lang };
      saveSettings(settings);
    },
    
    toggleFullConjugationMode() {
      settings = { ...settings, fullConjugationMode: !settings.fullConjugationMode };
      saveSettings(settings);
    },
    
    toggleAudio() {
      settings = { ...settings, audioEnabled: !settings.audioEnabled };
      saveSettings(settings);
    },
    
    setWordTypes(wordTypes: 'nouns' | 'verbs' | 'both') {
      settings = { ...settings, wordTypes };
      saveSettings(settings);
    },
    
    reset() {
      settings = defaultSettings;
      saveSettings(settings);
    }
  };
}

export const settingsStore = createSettingsStore();
