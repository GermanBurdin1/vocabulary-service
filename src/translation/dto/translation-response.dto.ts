import { GrammarData } from "src/grammar/dto/grammar-data.dto";

export class TranslationResponseDto {
	word: string;
	translations: string[];
	sourceLang: 'ru' | 'fr' | 'en';
	targetLang: 'ru' | 'fr' | 'en';
	from: 'wiktionary' | 'api' | 'cache';
	grammar?: GrammarData
}
