// Multi-language vocabulary data with full conjugation support
// Supports: German (de), French (fr), Spanish (es), Norwegian (no), English (en)
//
// This file re-exports everything from the split vocabulary files for backward compatibility.
// New code should import directly from vocabulary-types.ts, nouns.ts, and verbs.ts

// Re-export shared types and helpers
export * from './vocabulary-types';

// Re-export noun types and data
export type {
  NounEntry,
  GermanNounData,
  FrenchNounData,
  SpanishNounData,
  NorwegianNounData,
  EnglishNounData,
} from './nouns';
export { nouns } from './nouns';

// Re-export verb types and data
export type {
  VerbEntry,
  GermanVerbData,
  FrenchVerbData,
  SpanishVerbData,
  NorwegianVerbData,
  EnglishVerbData,
  GermanConjugation,
  FrenchConjugation,
  SpanishConjugation,
} from './verbs';
export { verbs } from './verbs';

// Re-export VocabularyItem union type
import type { NounEntry } from './nouns';
import type { VerbEntry } from './verbs';
export type VocabularyItem = NounEntry | VerbEntry;

// Re-export combined vocabulary array for backward compatibility
import { nouns } from './nouns';
import { verbs } from './verbs';
export const vocabulary: VocabularyItem[] = [...nouns, ...verbs];
