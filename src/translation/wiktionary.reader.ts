import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import {
	GrammarData,
	NounGrammar,
	VerbGrammar,
	AdjectiveGrammar,
	AdverbGrammar,
	PronounGrammar,
	PrepositionGrammar,
	ConjunctionGrammar,
	InterjectionGrammar,
	ExpressionGrammar,
	PartOfSpeech
} from 'src/grammar/dto/grammar-data.dto';


export class WiktionaryReader {
	private filePath = path.join(__dirname, '..', '..', 'data', 'frwiktionary.jsonl');

	async find(word: string, targetLang: 'ru' | 'en'): Promise<any[]> {
		const results: any[] = [];

		const fileStream = fs.createReadStream(this.filePath);
		const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

		for await (const line of rl) {
			if (!line.trim()) continue;

			const entry = JSON.parse(line);
			if (entry.word?.toLowerCase() !== word.toLowerCase()) continue;

			const translations = entry.senses?.flatMap(sense =>
				(sense.translations || []).filter(t => t.lang === targetLang)
			);

			if (translations.length > 0) {
				results.push({ word: entry.word, pos: entry.pos, translations });
			}
		}

		return results;
	}

	isPartOfSpeech(pos: any): pos is PartOfSpeech {
		return [
			'noun', 'verb', 'adjective', 'adverb',
			'pronoun', 'preposition', 'conjunction',
			'interjection', 'expression'
		].includes(pos);
	}

	extractGrammar(tags: string[] = [], pos: string): GrammarData {
		return this.extractGrammarFromEntry({ pos, senses: [{ tags }] });
	}

	extractGrammarFromEntry(entry: any): GrammarData {
		const pos = entry.pos;
		const tags = entry.senses?.flatMap((s: any) => s.tags || []) || [];
		const forms = entry.forms || [];
		const headArgs = entry.head_templates?.[0]?.args || {};
		const categories = entry.categories?.map((c: any) => c.name) || [];
		const origin = entry.etymology_text;

		switch (pos) {
			case 'noun':
				const noun: NounGrammar = {
					partOfSpeech: 'noun',
					gender: tags.includes('feminine') ? 'feminine' :
						tags.includes('masculine') ? 'masculine' : undefined,
					number: tags.includes('plural') || forms.some(f => f.tags?.includes('plural')) ? 'plural' : undefined,
					isProper: categories.some(c => c.includes('proper noun')) || undefined
				};
				return noun;

			case 'verb':
				const verb: VerbGrammar = {
					partOfSpeech: 'verb',
					transitivity: tags.includes('transitive') ? 'transitive' :
						tags.includes('intransitive') ? 'intransitive' : undefined,
					isIrregular: !!headArgs.irreg || !!headArgs.irr || undefined,
					isPronominal: !!headArgs.pron || categories.some(c => c.includes('reflexive')) || undefined
				};
				return verb;

			case 'adjective':
				const adj: AdjectiveGrammar = {
					partOfSpeech: 'adjective',
					variable: tags.includes('invariable') ? false : true,
					comparison: tags.includes('comparative') ? 'comparative' :
						tags.includes('superlative') ? 'superlative' : undefined
				};
				return adj;

			case 'adverb':
				const adv: AdverbGrammar = {
					partOfSpeech: 'adverb',
					comparison: tags.includes('comparative') ? 'comparative' :
						tags.includes('superlative') ? 'superlative' : undefined
				};
				return adv;

			case 'pronoun':
				const typeMatch = ['personal', 'reflexive', 'demonstrative', 'possessive', 'interrogative', 'relative', 'indefinite']
					.find(t => categories.some(c => c.includes(`${t} pronoun`))) as PronounGrammar['type'] | undefined;

				const pronoun: PronounGrammar = {
					partOfSpeech: 'pronoun',
					person: tags.includes('first-person') ? 1 :
						tags.includes('second-person') ? 2 :
							tags.includes('third-person') ? 3 : undefined,
					gender: tags.includes('feminine') ? 'feminine' :
						tags.includes('masculine') ? 'masculine' : undefined,
					number: tags.includes('plural') ? 'plural' : undefined,
					type: typeMatch,
				};
				return pronoun;

			case 'preposition':
				const prep: PrepositionGrammar = {
					partOfSpeech: 'preposition'
				};
				return prep;

			case 'conjunction':
				const conj: ConjunctionGrammar = {
					partOfSpeech: 'conjunction',
					type: categories.some(c => c.includes('coordinating conjunction')) ? 'coordinating' :
						categories.some(c => c.includes('subordinating conjunction')) ? 'subordinating' : undefined
				};
				return conj;

			case 'interjection':
				const intj: InterjectionGrammar = {
					partOfSpeech: 'interjection',
					emotionType: categories.find(c => c.toLowerCase().includes('emotion')) // если найдёшь что-то подходящее
				};
				return intj;

			case 'expression':
				const exprType = ['idiom', 'proverb', 'saying', 'quote', 'collocation']
					.find(t => tags.includes(t)) as ExpressionGrammar['expressionType'] | undefined;

				const expr: ExpressionGrammar = {
					partOfSpeech: 'expression',
					expressionType: exprType,
					origin,
				};
				return expr;

			default:
				throw new Error(`❌ Неизвестная часть речи: ${pos}`);
		}
	}



}
