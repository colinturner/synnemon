import { browser } from '$app/environment';
import type { AppSettings } from '$lib/types';
import type { BaseLanguage } from '$lib/data/vocabulary';

const SETTINGS_KEY = 'german-drills-settings';

const defaultSettings: AppSettings = {
  baseLanguage: 'en',
  fullConjugationMode: false,
  audioEnabled: true
};

function loadSettings(): AppSettings {
  if (!browser) return defaultSettings;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
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
    
    setBaseLanguage(lang: BaseLanguage) {
      settings = { ...settings, baseLanguage: lang };
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
    
    reset() {
      settings = defaultSettings;
      saveSettings(settings);
    }
  };
}

export const settingsStore = createSettingsStore();

