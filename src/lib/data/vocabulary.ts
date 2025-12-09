// German vocabulary data with translations in English and Norwegian
// Article colors: der (masculine) = blue, die (feminine) = pink, das (neuter) = green

export type Gender = 'masculine' | 'feminine' | 'neuter';
export type WordType = 'noun' | 'verb';
export type BaseLanguage = 'en' | 'no';

export interface NounData {
  type: 'noun';
  german: string;
  gender: Gender;
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

export type VocabularyItem = NounData | VerbData;

export const vocabulary: VocabularyItem[] = [
  // === NOUNS (30) ===
  {
    type: 'noun',
    german: 'Haus',
    gender: 'neuter',
    plural: 'Häuser',
    translations: { en: 'house', no: 'hus' },
    examples: {
      german: 'Das Haus ist sehr alt.',
      en: 'The house is very old.',
      no: 'Huset er veldig gammelt.'
    }
  },
  {
    type: 'noun',
    german: 'Buch',
    gender: 'neuter',
    plural: 'Bücher',
    translations: { en: 'book', no: 'bok' },
    examples: {
      german: 'Ich lese ein interessantes Buch.',
      en: 'I am reading an interesting book.',
      no: 'Jeg leser en interessant bok.'
    }
  },
  {
    type: 'noun',
    german: 'Tisch',
    gender: 'masculine',
    plural: 'Tische',
    translations: { en: 'table', no: 'bord' },
    examples: {
      german: 'Der Tisch steht im Wohnzimmer.',
      en: 'The table is in the living room.',
      no: 'Bordet står i stua.'
    }
  },
  {
    type: 'noun',
    german: 'Frau',
    gender: 'feminine',
    plural: 'Frauen',
    translations: { en: 'woman', no: 'kvinne' },
    examples: {
      german: 'Die Frau arbeitet als Ärztin.',
      en: 'The woman works as a doctor.',
      no: 'Kvinnen jobber som lege.'
    }
  },
  {
    type: 'noun',
    german: 'Mann',
    gender: 'masculine',
    plural: 'Männer',
    translations: { en: 'man', no: 'mann' },
    examples: {
      german: 'Der Mann liest eine Zeitung.',
      en: 'The man is reading a newspaper.',
      no: 'Mannen leser en avis.'
    }
  },
  {
    type: 'noun',
    german: 'Kind',
    gender: 'neuter',
    plural: 'Kinder',
    translations: { en: 'child', no: 'barn' },
    examples: {
      german: 'Das Kind spielt im Garten.',
      en: 'The child is playing in the garden.',
      no: 'Barnet leker i hagen.'
    }
  },
  {
    type: 'noun',
    german: 'Hund',
    gender: 'masculine',
    plural: 'Hunde',
    translations: { en: 'dog', no: 'hund' },
    examples: {
      german: 'Der Hund bellt laut.',
      en: 'The dog barks loudly.',
      no: 'Hunden bjeffer høyt.'
    }
  },
  {
    type: 'noun',
    german: 'Katze',
    gender: 'feminine',
    plural: 'Katzen',
    translations: { en: 'cat', no: 'katt' },
    examples: {
      german: 'Die Katze schläft auf dem Sofa.',
      en: 'The cat is sleeping on the sofa.',
      no: 'Katten sover på sofaen.'
    }
  },
  {
    type: 'noun',
    german: 'Auto',
    gender: 'neuter',
    plural: 'Autos',
    translations: { en: 'car', no: 'bil' },
    examples: {
      german: 'Das Auto ist rot.',
      en: 'The car is red.',
      no: 'Bilen er rød.'
    }
  },
  {
    type: 'noun',
    german: 'Straße',
    gender: 'feminine',
    plural: 'Straßen',
    translations: { en: 'street', no: 'gate' },
    examples: {
      german: 'Die Straße ist sehr lang.',
      en: 'The street is very long.',
      no: 'Gaten er veldig lang.'
    }
  },
  {
    type: 'noun',
    german: 'Stadt',
    gender: 'feminine',
    plural: 'Städte',
    translations: { en: 'city', no: 'by' },
    examples: {
      german: 'Die Stadt hat viele Parks.',
      en: 'The city has many parks.',
      no: 'Byen har mange parker.'
    }
  },
  {
    type: 'noun',
    german: 'Land',
    gender: 'neuter',
    plural: 'Länder',
    translations: { en: 'country', no: 'land' },
    examples: {
      german: 'Das Land ist wunderschön.',
      en: 'The country is beautiful.',
      no: 'Landet er vakkert.'
    }
  },
  {
    type: 'noun',
    german: 'Wasser',
    gender: 'neuter',
    plural: 'Wasser',
    translations: { en: 'water', no: 'vann' },
    examples: {
      german: 'Das Wasser ist kalt.',
      en: 'The water is cold.',
      no: 'Vannet er kaldt.'
    }
  },
  {
    type: 'noun',
    german: 'Brot',
    gender: 'neuter',
    plural: 'Brote',
    translations: { en: 'bread', no: 'brød' },
    examples: {
      german: 'Das Brot ist frisch gebacken.',
      en: 'The bread is freshly baked.',
      no: 'Brødet er nystekt.'
    }
  },
  {
    type: 'noun',
    german: 'Apfel',
    gender: 'masculine',
    plural: 'Äpfel',
    translations: { en: 'apple', no: 'eple' },
    examples: {
      german: 'Der Apfel ist süß.',
      en: 'The apple is sweet.',
      no: 'Eplet er søtt.'
    }
  },
  {
    type: 'noun',
    german: 'Freund',
    gender: 'masculine',
    plural: 'Freunde',
    translations: { en: 'friend', no: 'venn' },
    examples: {
      german: 'Mein Freund kommt morgen.',
      en: 'My friend is coming tomorrow.',
      no: 'Vennen min kommer i morgen.'
    }
  },
  {
    type: 'noun',
    german: 'Schule',
    gender: 'feminine',
    plural: 'Schulen',
    translations: { en: 'school', no: 'skole' },
    examples: {
      german: 'Die Schule beginnt um acht Uhr.',
      en: 'The school starts at eight o\'clock.',
      no: 'Skolen begynner klokken åtte.'
    }
  },
  {
    type: 'noun',
    german: 'Arbeit',
    gender: 'feminine',
    plural: 'Arbeiten',
    translations: { en: 'work', no: 'arbeid' },
    examples: {
      german: 'Die Arbeit macht mir Spaß.',
      en: 'The work is fun for me.',
      no: 'Arbeidet er gøy for meg.'
    }
  },
  {
    type: 'noun',
    german: 'Zeit',
    gender: 'feminine',
    plural: 'Zeiten',
    translations: { en: 'time', no: 'tid' },
    examples: {
      german: 'Die Zeit vergeht schnell.',
      en: 'Time passes quickly.',
      no: 'Tiden går fort.'
    }
  },
  {
    type: 'noun',
    german: 'Jahr',
    gender: 'neuter',
    plural: 'Jahre',
    translations: { en: 'year', no: 'år' },
    examples: {
      german: 'Das Jahr hat zwölf Monate.',
      en: 'The year has twelve months.',
      no: 'Året har tolv måneder.'
    }
  },
  {
    type: 'noun',
    german: 'Tag',
    gender: 'masculine',
    plural: 'Tage',
    translations: { en: 'day', no: 'dag' },
    examples: {
      german: 'Der Tag war sehr lang.',
      en: 'The day was very long.',
      no: 'Dagen var veldig lang.'
    }
  },
  {
    type: 'noun',
    german: 'Nacht',
    gender: 'feminine',
    plural: 'Nächte',
    translations: { en: 'night', no: 'natt' },
    examples: {
      german: 'Die Nacht ist dunkel.',
      en: 'The night is dark.',
      no: 'Natten er mørk.'
    }
  },
  {
    type: 'noun',
    german: 'Mutter',
    gender: 'feminine',
    plural: 'Mütter',
    translations: { en: 'mother', no: 'mor' },
    examples: {
      german: 'Meine Mutter kocht gern.',
      en: 'My mother likes to cook.',
      no: 'Moren min liker å lage mat.'
    }
  },
  {
    type: 'noun',
    german: 'Vater',
    gender: 'masculine',
    plural: 'Väter',
    translations: { en: 'father', no: 'far' },
    examples: {
      german: 'Mein Vater arbeitet viel.',
      en: 'My father works a lot.',
      no: 'Faren min jobber mye.'
    }
  },
  {
    type: 'noun',
    german: 'Fenster',
    gender: 'neuter',
    plural: 'Fenster',
    translations: { en: 'window', no: 'vindu' },
    examples: {
      german: 'Das Fenster ist offen.',
      en: 'The window is open.',
      no: 'Vinduet er åpent.'
    }
  },
  {
    type: 'noun',
    german: 'Tür',
    gender: 'feminine',
    plural: 'Türen',
    translations: { en: 'door', no: 'dør' },
    examples: {
      german: 'Die Tür ist geschlossen.',
      en: 'The door is closed.',
      no: 'Døren er lukket.'
    }
  },
  {
    type: 'noun',
    german: 'Zimmer',
    gender: 'neuter',
    plural: 'Zimmer',
    translations: { en: 'room', no: 'rom' },
    examples: {
      german: 'Das Zimmer ist hell.',
      en: 'The room is bright.',
      no: 'Rommet er lyst.'
    }
  },
  {
    type: 'noun',
    german: 'Küche',
    gender: 'feminine',
    plural: 'Küchen',
    translations: { en: 'kitchen', no: 'kjøkken' },
    examples: {
      german: 'Die Küche ist modern.',
      en: 'The kitchen is modern.',
      no: 'Kjøkkenet er moderne.'
    }
  },
  {
    type: 'noun',
    german: 'Garten',
    gender: 'masculine',
    plural: 'Gärten',
    translations: { en: 'garden', no: 'hage' },
    examples: {
      german: 'Der Garten ist voller Blumen.',
      en: 'The garden is full of flowers.',
      no: 'Hagen er full av blomster.'
    }
  },
  {
    type: 'noun',
    german: 'Baum',
    gender: 'masculine',
    plural: 'Bäume',
    translations: { en: 'tree', no: 'tre' },
    examples: {
      german: 'Der Baum ist sehr groß.',
      en: 'The tree is very big.',
      no: 'Treet er veldig stort.'
    }
  },

  // === VERBS (20) ===
  {
    type: 'verb',
    infinitive: 'gehen',
    translations: { en: 'to go', no: 'å gå' },
    conjugations: {
      präsens: {
        ich: 'gehe',
        du: 'gehst',
        'er/sie/es': 'geht',
        wir: 'gehen',
        ihr: 'geht',
        sie: 'gehen'
      },
      präteritum: {
        ich: 'ging',
        du: 'gingst',
        'er/sie/es': 'ging',
        wir: 'gingen',
        ihr: 'gingt',
        sie: 'gingen'
      },
      perfekt: {
        auxiliary: 'sein',
        partizip: 'gegangen'
      }
    },
    examples: {
      german: 'Ich gehe jeden Tag zur Arbeit.',
      en: 'I go to work every day.',
      no: 'Jeg går til jobb hver dag.'
    }
  },
  {
    type: 'verb',
    infinitive: 'kommen',
    translations: { en: 'to come', no: 'å komme' },
    conjugations: {
      präsens: {
        ich: 'komme',
        du: 'kommst',
        'er/sie/es': 'kommt',
        wir: 'kommen',
        ihr: 'kommt',
        sie: 'kommen'
      },
      präteritum: {
        ich: 'kam',
        du: 'kamst',
        'er/sie/es': 'kam',
        wir: 'kamen',
        ihr: 'kamt',
        sie: 'kamen'
      },
      perfekt: {
        auxiliary: 'sein',
        partizip: 'gekommen'
      }
    },
    examples: {
      german: 'Er kommt aus Deutschland.',
      en: 'He comes from Germany.',
      no: 'Han kommer fra Tyskland.'
    }
  },
  {
    type: 'verb',
    infinitive: 'machen',
    translations: { en: 'to make/do', no: 'å gjøre/lage' },
    conjugations: {
      präsens: {
        ich: 'mache',
        du: 'machst',
        'er/sie/es': 'macht',
        wir: 'machen',
        ihr: 'macht',
        sie: 'machen'
      },
      präteritum: {
        ich: 'machte',
        du: 'machtest',
        'er/sie/es': 'machte',
        wir: 'machten',
        ihr: 'machtet',
        sie: 'machten'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gemacht'
      }
    },
    examples: {
      german: 'Was machst du heute Abend?',
      en: 'What are you doing tonight?',
      no: 'Hva gjør du i kveld?'
    }
  },
  {
    type: 'verb',
    infinitive: 'haben',
    translations: { en: 'to have', no: 'å ha' },
    conjugations: {
      präsens: {
        ich: 'habe',
        du: 'hast',
        'er/sie/es': 'hat',
        wir: 'haben',
        ihr: 'habt',
        sie: 'haben'
      },
      präteritum: {
        ich: 'hatte',
        du: 'hattest',
        'er/sie/es': 'hatte',
        wir: 'hatten',
        ihr: 'hattet',
        sie: 'hatten'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gehabt'
      }
    },
    examples: {
      german: 'Ich habe zwei Brüder.',
      en: 'I have two brothers.',
      no: 'Jeg har to brødre.'
    }
  },
  {
    type: 'verb',
    infinitive: 'sein',
    translations: { en: 'to be', no: 'å være' },
    conjugations: {
      präsens: {
        ich: 'bin',
        du: 'bist',
        'er/sie/es': 'ist',
        wir: 'sind',
        ihr: 'seid',
        sie: 'sind'
      },
      präteritum: {
        ich: 'war',
        du: 'warst',
        'er/sie/es': 'war',
        wir: 'waren',
        ihr: 'wart',
        sie: 'waren'
      },
      perfekt: {
        auxiliary: 'sein',
        partizip: 'gewesen'
      }
    },
    examples: {
      german: 'Ich bin müde.',
      en: 'I am tired.',
      no: 'Jeg er trøtt.'
    }
  },
  {
    type: 'verb',
    infinitive: 'essen',
    translations: { en: 'to eat', no: 'å spise' },
    conjugations: {
      präsens: {
        ich: 'esse',
        du: 'isst',
        'er/sie/es': 'isst',
        wir: 'essen',
        ihr: 'esst',
        sie: 'essen'
      },
      präteritum: {
        ich: 'aß',
        du: 'aßt',
        'er/sie/es': 'aß',
        wir: 'aßen',
        ihr: 'aßt',
        sie: 'aßen'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gegessen'
      }
    },
    examples: {
      german: 'Wir essen zu Mittag.',
      en: 'We are eating lunch.',
      no: 'Vi spiser lunsj.'
    }
  },
  {
    type: 'verb',
    infinitive: 'trinken',
    translations: { en: 'to drink', no: 'å drikke' },
    conjugations: {
      präsens: {
        ich: 'trinke',
        du: 'trinkst',
        'er/sie/es': 'trinkt',
        wir: 'trinken',
        ihr: 'trinkt',
        sie: 'trinken'
      },
      präteritum: {
        ich: 'trank',
        du: 'trankst',
        'er/sie/es': 'trank',
        wir: 'tranken',
        ihr: 'trankt',
        sie: 'tranken'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'getrunken'
      }
    },
    examples: {
      german: 'Er trinkt gern Kaffee.',
      en: 'He likes to drink coffee.',
      no: 'Han liker å drikke kaffe.'
    }
  },
  {
    type: 'verb',
    infinitive: 'schlafen',
    translations: { en: 'to sleep', no: 'å sove' },
    conjugations: {
      präsens: {
        ich: 'schlafe',
        du: 'schläfst',
        'er/sie/es': 'schläft',
        wir: 'schlafen',
        ihr: 'schlaft',
        sie: 'schlafen'
      },
      präteritum: {
        ich: 'schlief',
        du: 'schliefst',
        'er/sie/es': 'schlief',
        wir: 'schliefen',
        ihr: 'schlieft',
        sie: 'schliefen'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'geschlafen'
      }
    },
    examples: {
      german: 'Das Kind schläft tief.',
      en: 'The child is sleeping deeply.',
      no: 'Barnet sover dypt.'
    }
  },
  {
    type: 'verb',
    infinitive: 'lesen',
    translations: { en: 'to read', no: 'å lese' },
    conjugations: {
      präsens: {
        ich: 'lese',
        du: 'liest',
        'er/sie/es': 'liest',
        wir: 'lesen',
        ihr: 'lest',
        sie: 'lesen'
      },
      präteritum: {
        ich: 'las',
        du: 'last',
        'er/sie/es': 'las',
        wir: 'lasen',
        ihr: 'last',
        sie: 'lasen'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gelesen'
      }
    },
    examples: {
      german: 'Sie liest ein Buch.',
      en: 'She is reading a book.',
      no: 'Hun leser en bok.'
    }
  },
  {
    type: 'verb',
    infinitive: 'schreiben',
    translations: { en: 'to write', no: 'å skrive' },
    conjugations: {
      präsens: {
        ich: 'schreibe',
        du: 'schreibst',
        'er/sie/es': 'schreibt',
        wir: 'schreiben',
        ihr: 'schreibt',
        sie: 'schreiben'
      },
      präteritum: {
        ich: 'schrieb',
        du: 'schriebst',
        'er/sie/es': 'schrieb',
        wir: 'schrieben',
        ihr: 'schriebt',
        sie: 'schrieben'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'geschrieben'
      }
    },
    examples: {
      german: 'Er schreibt einen Brief.',
      en: 'He is writing a letter.',
      no: 'Han skriver et brev.'
    }
  },
  {
    type: 'verb',
    infinitive: 'sprechen',
    translations: { en: 'to speak', no: 'å snakke' },
    conjugations: {
      präsens: {
        ich: 'spreche',
        du: 'sprichst',
        'er/sie/es': 'spricht',
        wir: 'sprechen',
        ihr: 'sprecht',
        sie: 'sprechen'
      },
      präteritum: {
        ich: 'sprach',
        du: 'sprachst',
        'er/sie/es': 'sprach',
        wir: 'sprachen',
        ihr: 'spracht',
        sie: 'sprachen'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gesprochen'
      }
    },
    examples: {
      german: 'Sie spricht drei Sprachen.',
      en: 'She speaks three languages.',
      no: 'Hun snakker tre språk.'
    }
  },
  {
    type: 'verb',
    infinitive: 'sehen',
    translations: { en: 'to see', no: 'å se' },
    conjugations: {
      präsens: {
        ich: 'sehe',
        du: 'siehst',
        'er/sie/es': 'sieht',
        wir: 'sehen',
        ihr: 'seht',
        sie: 'sehen'
      },
      präteritum: {
        ich: 'sah',
        du: 'sahst',
        'er/sie/es': 'sah',
        wir: 'sahen',
        ihr: 'saht',
        sie: 'sahen'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gesehen'
      }
    },
    examples: {
      german: 'Ich sehe einen Vogel.',
      en: 'I see a bird.',
      no: 'Jeg ser en fugl.'
    }
  },
  {
    type: 'verb',
    infinitive: 'hören',
    translations: { en: 'to hear', no: 'å høre' },
    conjugations: {
      präsens: {
        ich: 'höre',
        du: 'hörst',
        'er/sie/es': 'hört',
        wir: 'hören',
        ihr: 'hört',
        sie: 'hören'
      },
      präteritum: {
        ich: 'hörte',
        du: 'hörtest',
        'er/sie/es': 'hörte',
        wir: 'hörten',
        ihr: 'hörtet',
        sie: 'hörten'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gehört'
      }
    },
    examples: {
      german: 'Hörst du die Musik?',
      en: 'Do you hear the music?',
      no: 'Hører du musikken?'
    }
  },
  {
    type: 'verb',
    infinitive: 'nehmen',
    translations: { en: 'to take', no: 'å ta' },
    conjugations: {
      präsens: {
        ich: 'nehme',
        du: 'nimmst',
        'er/sie/es': 'nimmt',
        wir: 'nehmen',
        ihr: 'nehmt',
        sie: 'nehmen'
      },
      präteritum: {
        ich: 'nahm',
        du: 'nahmst',
        'er/sie/es': 'nahm',
        wir: 'nahmen',
        ihr: 'nahmt',
        sie: 'nahmen'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'genommen'
      }
    },
    examples: {
      german: 'Ich nehme den Bus.',
      en: 'I take the bus.',
      no: 'Jeg tar bussen.'
    }
  },
  {
    type: 'verb',
    infinitive: 'geben',
    translations: { en: 'to give', no: 'å gi' },
    conjugations: {
      präsens: {
        ich: 'gebe',
        du: 'gibst',
        'er/sie/es': 'gibt',
        wir: 'geben',
        ihr: 'gebt',
        sie: 'geben'
      },
      präteritum: {
        ich: 'gab',
        du: 'gabst',
        'er/sie/es': 'gab',
        wir: 'gaben',
        ihr: 'gabt',
        sie: 'gaben'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gegeben'
      }
    },
    examples: {
      german: 'Er gibt mir ein Geschenk.',
      en: 'He gives me a gift.',
      no: 'Han gir meg en gave.'
    }
  },
  {
    type: 'verb',
    infinitive: 'fahren',
    translations: { en: 'to drive/travel', no: 'å kjøre/reise' },
    conjugations: {
      präsens: {
        ich: 'fahre',
        du: 'fährst',
        'er/sie/es': 'fährt',
        wir: 'fahren',
        ihr: 'fahrt',
        sie: 'fahren'
      },
      präteritum: {
        ich: 'fuhr',
        du: 'fuhrst',
        'er/sie/es': 'fuhr',
        wir: 'fuhren',
        ihr: 'fuhrt',
        sie: 'fuhren'
      },
      perfekt: {
        auxiliary: 'sein',
        partizip: 'gefahren'
      }
    },
    examples: {
      german: 'Wir fahren nach Berlin.',
      en: 'We are driving to Berlin.',
      no: 'Vi kjører til Berlin.'
    }
  },
  {
    type: 'verb',
    infinitive: 'wissen',
    translations: { en: 'to know (fact)', no: 'å vite' },
    conjugations: {
      präsens: {
        ich: 'weiß',
        du: 'weißt',
        'er/sie/es': 'weiß',
        wir: 'wissen',
        ihr: 'wisst',
        sie: 'wissen'
      },
      präteritum: {
        ich: 'wusste',
        du: 'wusstest',
        'er/sie/es': 'wusste',
        wir: 'wussten',
        ihr: 'wusstet',
        sie: 'wussten'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gewusst'
      }
    },
    examples: {
      german: 'Ich weiß die Antwort.',
      en: 'I know the answer.',
      no: 'Jeg vet svaret.'
    }
  },
  {
    type: 'verb',
    infinitive: 'kennen',
    translations: { en: 'to know (person)', no: 'å kjenne' },
    conjugations: {
      präsens: {
        ich: 'kenne',
        du: 'kennst',
        'er/sie/es': 'kennt',
        wir: 'kennen',
        ihr: 'kennt',
        sie: 'kennen'
      },
      präteritum: {
        ich: 'kannte',
        du: 'kanntest',
        'er/sie/es': 'kannte',
        wir: 'kannten',
        ihr: 'kanntet',
        sie: 'kannten'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gekannt'
      }
    },
    examples: {
      german: 'Kennst du meinen Bruder?',
      en: 'Do you know my brother?',
      no: 'Kjenner du broren min?'
    }
  },
  {
    type: 'verb',
    infinitive: 'kaufen',
    translations: { en: 'to buy', no: 'å kjøpe' },
    conjugations: {
      präsens: {
        ich: 'kaufe',
        du: 'kaufst',
        'er/sie/es': 'kauft',
        wir: 'kaufen',
        ihr: 'kauft',
        sie: 'kaufen'
      },
      präteritum: {
        ich: 'kaufte',
        du: 'kauftest',
        'er/sie/es': 'kaufte',
        wir: 'kauften',
        ihr: 'kauftet',
        sie: 'kauften'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gekauft'
      }
    },
    examples: {
      german: 'Sie kauft ein neues Kleid.',
      en: 'She buys a new dress.',
      no: 'Hun kjøper en ny kjole.'
    }
  },
  {
    type: 'verb',
    infinitive: 'arbeiten',
    translations: { en: 'to work', no: 'å arbeide' },
    conjugations: {
      präsens: {
        ich: 'arbeite',
        du: 'arbeitest',
        'er/sie/es': 'arbeitet',
        wir: 'arbeiten',
        ihr: 'arbeitet',
        sie: 'arbeiten'
      },
      präteritum: {
        ich: 'arbeitete',
        du: 'arbeitetest',
        'er/sie/es': 'arbeitete',
        wir: 'arbeiteten',
        ihr: 'arbeitetet',
        sie: 'arbeiteten'
      },
      perfekt: {
        auxiliary: 'haben',
        partizip: 'gearbeitet'
      }
    },
    examples: {
      german: 'Er arbeitet in einem Büro.',
      en: 'He works in an office.',
      no: 'Han arbeider på et kontor.'
    }
  }
];

// Helper function to get article by gender
export function getArticle(gender: Gender): string {
  switch (gender) {
    case 'masculine': return 'der';
    case 'feminine': return 'die';
    case 'neuter': return 'das';
  }
}

// Helper function to get article color class
export function getArticleColorClass(gender: Gender): string {
  switch (gender) {
    case 'masculine': return 'text-blue-500';
    case 'feminine': return 'text-pink-500';
    case 'neuter': return 'text-green-500';
  }
}

