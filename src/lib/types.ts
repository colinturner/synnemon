import type { BaseLanguage } from './data/vocabulary';

// User progress data stored in Supabase
export interface UserProgress {
  user_id: string;
  word_id: string; // e.g., "noun:Haus" or "verb:gehen"
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
  baseLanguage: BaseLanguage;
  fullConjugationMode: boolean;
  audioEnabled: boolean;
}

// Drill state for a single word
export type DrillPhase = 
  | 'article' // Typing the article (for nouns)
  | 'singular' // Typing the singular form
  | 'plural' // Typing the plural form  
  | 'infinitive' // Typing the infinitive (for verbs)
  | 'conjugation' // Typing "du [conjugated]"
  | 'translation' // Showing translation
  | 'example-german' // Showing German example
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

