import type { Language } from './data/vocabulary';

// User progress data stored in Supabase
export interface UserProgress {
  user_id: string;
  word_id: string; // e.g., "noun:house" or "verb:go"
  correct_count: number;
  incorrect_count: number;
  last_reviewed: string; // ISO date string
  next_review: string; // ISO date string (for spaced repetition)
  ease_factor: number; // SM-2 algorithm ease factor
  interval: number; // Days until next review
}

// Session state (not persisted)
export interface DrillSession {
  currentWordIndex: number;
  wordsInSession: string[]; // word IDs
  sessionStarted: string;
  correctThisSession: number;
  incorrectThisSession: number;
}

// App settings
export interface AppSettings {
  baseLanguage: Language; // The language the user knows (for translations)
  targetLanguage: Language; // The language being learned (drilled)
  fullConjugationMode: boolean;
  audioEnabled: boolean;
  wordTypes: 'nouns' | 'verbs' | 'both'; // Which word types to drill
}

// Drill state for a single word
export type DrillPhase = 
  | 'article' // Typing the article (for nouns)
  | 'singular' // Typing the singular form
  | 'plural' // Typing the plural form  
  | 'definite' // Typing the definite form (Norwegian)
  | 'infinitive' // Typing the infinitive (for verbs)
  | 'conjugation' // Typing first conjugated form (e.g., präsens for German)
  | 'conjugation2' // Typing second conjugated form (e.g., perfekt for German)
  | 'conjugation3' // Typing third conjugated form (e.g., passé composé for French)
  | 'translation' // Showing translation
  | 'example-target' // Showing target language example
  | 'example-base' // Showing base language example
  | 'complete'; // Word complete, ready for next

export interface DrillState {
  phase: DrillPhase;
  userInput: string;
  expectedInput: string;
  hasError: boolean;
  errorChar: string;
  completedSegments: string[]; // Already completed parts
}

// Auth state
export interface AuthState {
  isAuthenticated: boolean;
  isAllowed: boolean; // Whether user is on allowlist
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  } | null;
  loading: boolean;
}
