export enum CardType {
  CONSONANT = 'CONSONANT',
  VOWEL = 'VOWEL'
}

export enum ThaiClass {
  LOW = 'Low',
  MID = 'Mid',
  HIGH = 'High',
  VOWEL_SHORT = 'Short Vowel',
  VOWEL_LONG = 'Long Vowel'
}

export interface ThaiChar {
  char: string;
  name: string;
  phonetic: string;
  meaning: string;
  class: ThaiClass;
  type: CardType;
  exampleWord: string;
  exampleMeaning: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
