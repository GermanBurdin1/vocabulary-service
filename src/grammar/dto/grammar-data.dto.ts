export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'expression';

// Базовый тип
export interface BaseGrammar {
  partOfSpeech: PartOfSpeech;
}

export interface NounGrammar extends BaseGrammar {
  partOfSpeech: 'noun';
  gender?: 'masculine' | 'feminine';
  number?: 'singular' | 'plural';
  isProper?: boolean;
}

export interface VerbGrammar extends BaseGrammar {
  partOfSpeech: 'verb';
  transitivity?: 'transitive' | 'intransitive';
  isIrregular?: boolean;
  isPronominal?: boolean;
}

export interface AdjectiveGrammar extends BaseGrammar {
  partOfSpeech: 'adjective';
  comparison?: 'positive' | 'comparative' | 'superlative';
  variable?: boolean;
}

export interface AdverbGrammar extends BaseGrammar {
  partOfSpeech: 'adverb';
  comparison?: 'positive' | 'comparative' | 'superlative';
}

export interface PronounGrammar extends BaseGrammar {
  partOfSpeech: 'pronoun';
  person?: 1 | 2 | 3;
  gender?: 'masculine' | 'feminine';
  number?: 'singular' | 'plural';
  type?: 'personal' | 'reflexive' | 'demonstrative' | 'possessive' | 'interrogative' | 'relative' | 'indefinite';
}

export interface PrepositionGrammar extends BaseGrammar {
  partOfSpeech: 'preposition';
}

export interface ConjunctionGrammar extends BaseGrammar {
  partOfSpeech: 'conjunction';
  type?: 'coordinating' | 'subordinating';
}

export interface InterjectionGrammar extends BaseGrammar {
  partOfSpeech: 'interjection';
  emotionType?: string;
}

export interface ExpressionGrammar extends BaseGrammar {
  partOfSpeech: 'expression';
  expressionType?: 'idiom' | 'proverb' | 'saying' | 'quote' | 'collocation' | 'other';
  origin?: string;
}

// Универсальный тип для всех
export type GrammarData =
  | NounGrammar
  | VerbGrammar
  | AdjectiveGrammar
  | AdverbGrammar
  | PronounGrammar
  | PrepositionGrammar
  | ConjunctionGrammar
  | InterjectionGrammar
  | ExpressionGrammar;
