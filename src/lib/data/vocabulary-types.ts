// Multi-language vocabulary shared types and helpers
// Supports: German (de), French (fr), Spanish (es), Norwegian (no), English (en)

// =============================================================================
// LANGUAGE TYPES
// =============================================================================

export type Language = 'de' | 'fr' | 'es' | 'no' | 'en';
export type WordType = 'noun' | 'verb';

// Gender systems per language
export type GermanGender = 'masculine' | 'feminine' | 'neuter';
export type FrenchGender = 'masculine' | 'feminine';
export type SpanishGender = 'masculine' | 'feminine';
export type NorwegianGender = 'masculine' | 'feminine' | 'neuter';

// Union type for any gender
export type Gender = GermanGender | FrenchGender | SpanishGender | NorwegianGender;

// =============================================================================
// DRILL CONFIGURATION
// =============================================================================

// What to test for nouns in each language
export interface NounDrillConfig {
  fields: string[]; // e.g., ['article', 'singular', 'plural']
  hasGender: boolean;
}

// What to test for verbs in each language
export interface VerbDrillConfig {
  primaryFields: {
    field1: { label: string; path: string }; // e.g., infinitive
    field2: { label: string; path: string }; // e.g., past tense form
    field3: { label: string; path: string }; // e.g., perfect form
  };
  conjugationDisplay: string[]; // Tenses to show when Option key is held
}

export const drillConfig: Record<Language, { noun: NounDrillConfig; verb: VerbDrillConfig }> = {
  de: {
    noun: {
      fields: ['article', 'singular', 'plural'],
      hasGender: true,
    },
    verb: {
      primaryFields: {
        field1: { label: 'Infinitiv', path: 'infinitive' },
        field2: { label: 'Präsens (du)', path: 'indicative.präsens.du' },
        field3: { label: 'Perfekt (du)', path: 'indicative.perfekt.conjugation.du' },
      },
      conjugationDisplay: ['präsens', 'präteritum', 'perfekt', 'futurI', 'plusquamperfekt', 'futurII', 'imperativ'],
    },
  },
  fr: {
    noun: {
      fields: ['article', 'singular', 'plural'],
      hasGender: true,
    },
    verb: {
      primaryFields: {
        field1: { label: 'Infinitif', path: 'infinitive' },
        field2: { label: 'Présent (tu)', path: 'indicative.présent.tu' },
        field3: { label: 'Imparfait (tu)', path: 'indicative.imparfait.tu' },
      },
      conjugationDisplay: ['présent', 'imparfait', 'passéSimple', 'passéComposé', 'plusQueParfait', 'futurSimple', 'futurAntérieur', 'impératif'],
    },
  },
  es: {
    noun: {
      fields: ['article', 'singular', 'plural'],
      hasGender: true,
    },
    verb: {
      primaryFields: {
        field1: { label: 'Infinitivo', path: 'infinitive' },
        field2: { label: 'Presente (tú)', path: 'indicative.presente.tú' },
        field3: { label: 'Pretérito indefinido (tú)', path: 'indicative.pretéritoIndefinido.tú' },
      },
      conjugationDisplay: ['presente', 'pretéritoImperfecto', 'pretéritoIndefinido', 'pretéritoPerfecto', 'pretéritoPluscuamperfecto', 'futuroSimple', 'futuroPerfecto', 'imperativo'],
    },
  },
  no: {
    noun: {
      fields: ['article', 'singular', 'definite', 'plural'],
      hasGender: true,
    },
    verb: {
      primaryFields: {
        field1: { label: 'Infinitiv', path: 'infinitive' },
        field2: { label: 'Presens', path: 'presens' },
        field3: { label: 'Perfektum', path: 'perfektum' },
      },
      conjugationDisplay: ['presens', 'preteritum', 'perfektum', 'pluskvamperfektum', 'futurum', 'imperativ'],
    },
  },
  en: {
    noun: {
      fields: ['singular', 'plural'],
      hasGender: false,
    },
    verb: {
      primaryFields: {
        field1: { label: 'Infinitive', path: 'infinitive' },
        field2: { label: 'Simple past', path: 'simplePast' },
        field3: { label: 'Past participle', path: 'pastParticiple' },
      },
      conjugationDisplay: ['present', 'past', 'perfect'],
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get article for a language and gender
export function getArticle(lang: Language, gender?: Gender): string {
  switch (lang) {
    case 'de':
      switch (gender) {
        case 'masculine': return 'der';
        case 'feminine': return 'die';
        case 'neuter': return 'das';
        default: return '';
      }
    case 'fr':
      switch (gender) {
        case 'masculine': return 'le';
        case 'feminine': return 'la';
        default: return '';
      }
    case 'es':
      switch (gender) {
        case 'masculine': return 'el';
        case 'feminine': return 'la';
        default: return '';
      }
    case 'no':
      switch (gender) {
        case 'masculine': return 'en';
        case 'feminine': return 'ei';
        case 'neuter': return 'et';
        default: return '';
      }
    case 'en':
      return 'the';
    default:
      return '';
  }
}

// Get indefinite article for a language and gender
export function getIndefiniteArticle(lang: Language, gender?: Gender): string {
  switch (lang) {
    case 'de':
      switch (gender) {
        case 'masculine': return 'ein';
        case 'feminine': return 'eine';
        case 'neuter': return 'ein';
        default: return '';
      }
    case 'fr':
      switch (gender) {
        case 'masculine': return 'un';
        case 'feminine': return 'une';
        default: return '';
      }
    case 'es':
      switch (gender) {
        case 'masculine': return 'un';
        case 'feminine': return 'una';
        default: return '';
      }
    case 'no':
      switch (gender) {
        case 'masculine': return 'en';
        case 'feminine': return 'ei';
        case 'neuter': return 'et';
        default: return '';
      }
    case 'en':
      return 'a';
    default:
      return '';
  }
}

// Get color class for gender display
export function getGenderColorClass(lang: Language, gender?: Gender): string {
  // German-style colors: masculine=blue, feminine=pink, neuter=green
  switch (gender) {
    case 'masculine': return 'text-blue-500';
    case 'feminine': return 'text-pink-500';
    case 'neuter': return 'text-green-500';
    default: return '';
  }
}

// Get language display name
export function getLanguageName(lang: Language): string {
  switch (lang) {
    case 'de': return 'German';
    case 'fr': return 'French';
    case 'es': return 'Spanish';
    case 'no': return 'Norwegian';
    case 'en': return 'English';
  }
}

// Get native language name
export function getNativeLanguageName(lang: Language): string {
  switch (lang) {
    case 'de': return 'Deutsch';
    case 'fr': return 'Français';
    case 'es': return 'Español';
    case 'no': return 'Norsk';
    case 'en': return 'English';
  }
}

// =============================================================================
// LEGACY COMPATIBILITY (for existing app code - to be removed after refactor)
// =============================================================================

// These types and functions maintain backward compatibility with existing code
// They should be removed once DrillInput.svelte and other files are updated

export type BaseLanguage = 'en' | 'no' | 'fr' | 'es' | 'de';

// Legacy noun interface for backward compatibility
export interface NounData {
  type: 'noun';
  german: string;
  gender: GermanGender;
  plural: string;
  translations: {
    en: string;
    no: string;
  };
  examples: {
    german: string;
    en: string;
    no: string;
  };
}

// Legacy verb interface for backward compatibility
export interface VerbData {
  type: 'verb';
  infinitive: string;
  translations: {
    en: string;
    no: string;
  };
  conjugations: {
    präsens: {
      ich: string;
      du: string;
      'er/sie/es': string;
      wir: string;
      ihr: string;
      sie: string;
    };
    präteritum: {
      ich: string;
      du: string;
      'er/sie/es': string;
      wir: string;
      ihr: string;
      sie: string;
    };
    perfekt: {
      auxiliary: 'haben' | 'sein';
      partizip: string;
    };
  };
  examples: {
    german: string;
    en: string;
    no: string;
  };
}

// Legacy helper to get German article (for backward compatibility)
export function getArticleForGerman(gender: GermanGender): string {
  return getArticle('de', gender);
}

// Legacy helper - kept for backward compatibility with existing code
export function getArticleColorClass(gender: GermanGender): string {
  return getGenderColorClass('de', gender);
}
