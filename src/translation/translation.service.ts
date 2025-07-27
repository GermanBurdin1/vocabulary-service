import { Injectable, NotFoundException } from '@nestjs/common';
import { Translation } from './translation.entity';
import { TranslationStats } from './translation-stats.entity';
import { LexiconService } from 'src/vocabulary/lexicon/lexicon.service';
import { WiktionaryReader } from './wiktionary.reader';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ManualTranslationDTO } from './dto/manual-translation.dto';
import { ExtraTranslationDTO } from './dto/extra-translation.dto';
import { UpdateTranslationDTO } from './dto/update-translation.dto';
import { Example } from './example.entity';
import { TranslationResponseDto } from './dto/translation-response.dto';
import {
	GrammarData,
	PartOfSpeech,
} from 'src/grammar/dto/grammar-data.dto';

import { Grammar } from 'src/grammar/grammar.entity';

type NewTranslation = Omit<Translation, 'id' | 'grammar'> & { grammar?: Grammar };
const isPartOfSpeech = (pos: string): pos is PartOfSpeech =>
	['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'expression'].includes(pos);

const isGender = (val: string): val is 'masculine' | 'feminine' =>
	['masculine', 'feminine'].includes(val);

const isTransitivity = (val: string): val is 'transitive' | 'intransitive' =>
	['transitive', 'intransitive'].includes(val);

const isExpressionType = (val: string): val is 'idiom' | 'proverb' | 'saying' | 'quote' | 'collocation' | 'other' =>
	['idiom', 'proverb', 'saying', 'quote', 'collocation', 'other'].includes(val);


@Injectable()
export class TranslationService {
	constructor(private configService: ConfigService,
		private lexiconService: LexiconService,
		@InjectRepository(Translation)
		private readonly translationRepo: Repository<Translation>,
		@InjectRepository(TranslationStats)
		private readonly statsRepo: Repository<TranslationStats>,) { }

	private readonly wiktionary = new WiktionaryReader();
	private deeplCallTimestamps: number[] = []; // en ms
	private readonly DEEPL_LIMIT = 10;
	private readonly DEEPL_INTERVAL = 60 * 1000; // 1 minute
	private stats = {
		cache: 0,
		wiktionary: 0,
		api: 0
	};

	async getStats(): Promise<{ source: string; count: number }[]> {
		const stats = await this.statsRepo.find({
			order: { count: 'DESC' }
		});

		return stats.map(stat => ({
			source: `${stat.sourceLang} → ${stat.targetLang} [${stat.from}]`,
			count: stat.count
		}));

	}

	private isDeeplRateLimited(): boolean {
		const now = Date.now();

		// on supprime les anciennes requêtes
		this.deeplCallTimestamps = this.deeplCallTimestamps.filter(ts => now - ts < this.DEEPL_INTERVAL);

		return this.deeplCallTimestamps.length >= this.DEEPL_LIMIT;
	}

	private async translateViaApi(
		source: string,
		sourceLang: 'ru' | 'fr' | 'en',
		targetLang: 'ru' | 'fr' | 'en'
	): Promise<string[]> {
		try {
			const apiKey = this.configService.get<string>('DEEPL_API_KEY');
			const response = await axios.post(
				'https://api-free.deepl.com/v2/translate',
				new URLSearchParams({
					text: source,
					source_lang: sourceLang.toUpperCase(),
					target_lang: targetLang.toUpperCase(),
					auth_key: apiKey,
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			const translated = response.data.translations[0]?.text;
			console.log(`[TranslationService] Traduction DeepL: ${translated}`);
			return translated ? [translated] : [];
		} catch (error) {
			console.error('[TranslationService] Erreur lors de l\'appel à DeepL API:', error.message);
			return [];
		}
	}


	async addTranslation(translation: NewTranslation): Promise<Translation> {
		const existing = await this.translationRepo.findOne({
			where: {
				source: translation.source.toLowerCase(),
				target: translation.target,
				sourceLang: translation.sourceLang,
				targetLang: translation.targetLang,
			}
		});

		if (existing) return existing;

		const newEntry = this.translationRepo.create({
			...translation,
			source: translation.source.toLowerCase(),
		});
		return this.translationRepo.save(newEntry);
	}

	async addManualTranslation(dto: ManualTranslationDTO): Promise<Translation> {
		const lexicon = await this.lexiconService.findById(dto.wordId);
		if (!lexicon) {
			throw new Error('Lexique introuvable');
		}

		const existing = await this.translationRepo.findOne({
			where: {
				source: dto.sourceText.toLowerCase(),
				target: dto.translation,
				sourceLang: dto.sourceLang,
				targetLang: dto.targetLang,
			},
		});

		if (existing) {
			console.log('[TranslationService] Traduction manuelle existe déjà:', existing);
			return existing;
		}

		const newEntry = this.translationRepo.create({
			source: dto.sourceText.toLowerCase(), 
			target: dto.translation,              
			sourceLang: dto.sourceLang,
			targetLang: dto.targetLang,
			meaning: 'manual',
			lexicon,
		});

		const saved = await this.translationRepo.save(newEntry);
		console.log('[TranslationService] Traduction manuelle sauvegardée:', saved);
		return saved;
	}

	// fonction helper pour convertir POS en GrammarData.pos
	mapPos(pos: string): PartOfSpeech | undefined {
		switch (pos) {
			case 'noun': return 'noun';
			case 'verb': return 'verb';
			case 'adj': return 'adjective';
			case 'adv': return 'adverb';
			case 'pron': return 'pronoun';
			case 'prep': return 'preposition';
			case 'conj': return 'conjunction';
			case 'intj': return 'interjection';
			case 'expression': return 'expression';
			default: return undefined;
		}
	}


	async findBySource(
		source: string,
		sourceLang: 'ru' | 'fr' | 'en',
		targetLang: 'ru' | 'fr' | 'en'
	): Promise<TranslationResponseDto> {
		console.log(`[TranslationService] findBySource source="${source}", sourceLang="${sourceLang}", targetLang="${targetLang}"`);

		// 1. recherche en base comme cache
		try {
			const existing = await this.translationRepo.findOne({
				where: {
					source: source.toLowerCase(),
					sourceLang,
					targetLang,
				},
			});

			if (existing) {
				console.log(`[TranslationService] Trouvé en BDD (cache): ${existing.target}`);
				this.stats.cache++;
				return {
					word: source,
					translations: [existing.target],
					sourceLang,
					targetLang,
					from: 'cache',
					grammar: existing.grammar && isPartOfSpeech(existing.grammar.partOfSpeech)
	? {
		partOfSpeech: existing.grammar.partOfSpeech,
		...(isGender(existing.grammar.gender) ? { gender: existing.grammar.gender } : {}),
		...(isTransitivity(existing.grammar.transitivity) ? { transitivity: existing.grammar.transitivity } : {}),
		...(isExpressionType(existing.grammar.expressionType) ? { expressionType: existing.grammar.expressionType } : {}),
	}
	: undefined,

				};
			}
		} catch (err) {
			console.error(`[TranslationService] Erreur lors de la recherche en BDD (cache):`, err);
		}

		// 2. tentative de recherche dans Wiktionary
		if (sourceLang === 'fr' && (targetLang === 'ru' || targetLang === 'en')) {
			try {
				const wiktionaryResults = await this.wiktionary.find(source, targetLang);
				console.log(`[TranslationService] Wiktionary trouvé:`, wiktionaryResults);

				if (wiktionaryResults.length > 0) {
					const translationsFromDict = wiktionaryResults.flatMap(entry =>
						entry.translations.map(t => t.word)
					);

					// infos grammaticales - on prend POS du premier résultat
					const grammar: GrammarData | undefined = wiktionaryResults[0]?.grammar;

					if (translationsFromDict[0]) {
						console.log(`[TranslationService] Sauvegarde traduction Wiktionary: ${translationsFromDict[0]}`);
						this.stats.wiktionary++;

						const lexicon = await this.lexiconService.findByWord(source);

						if (lexicon) {

							let grammarEntity: Grammar | undefined = undefined;

							if (grammar) {
								const g = new Grammar();
								g.partOfSpeech = grammar.partOfSpeech;

								if ('gender' in grammar) g.gender = grammar.gender;
								if ('transitivity' in grammar) g.transitivity = grammar.transitivity;
								if ('expressionType' in grammar) g.expressionType = grammar.expressionType;

								grammarEntity = g;
							}



							await this.addTranslation({
								source,
								target: translationsFromDict[0],
								sourceLang,
								targetLang,
								meaning: 'wiktionary',
								lexicon,
								examples: [],
								grammar: grammarEntity, // on sauvegarde si on a
							});

							await this.lexiconService.markAsTranslated(lexicon.id);
						}
					}

					return {
						word: source,
						translations: translationsFromDict,
						sourceLang,
						targetLang,
						from: 'wiktionary',
						grammar,
					};
				}
			} catch (err) {
				console.error(`[TranslationService] Erreur lors de la recherche Wiktionary:`, err);
			}
		}

		// 3. si rien trouvé - DeepL
		try {
			const apiResults = await this.translateViaApi(source, sourceLang, targetLang);
			console.log(`[TranslationService] DeepL a retourné:`, apiResults);

			if (apiResults[0]) {
				console.log(`[TranslationService] Sauvegarde traduction DeepL: ${apiResults[0]}`);
				this.stats.api++;

				const lexicon = await this.lexiconService.findByWord(source);

				if (lexicon) {
					await this.addTranslation({
						source,
						target: apiResults[0],
						sourceLang,
						targetLang,
						meaning: 'deepl',
						lexicon,
						examples: [],
						// grammar: on n'extrait pas de deepl
					});

					await this.lexiconService.markAsTranslated(lexicon.id);
				}
			}

			return {
				word: source,
				translations: apiResults,
				sourceLang,
				targetLang,
				from: 'api',
				grammar: undefined,
			};
		} catch (err) {
			console.error(`[TranslationService] Erreur lors de la requête DeepL:`, err);
			throw new Error('DEEPL_FAILED');
		}
	}


	async addExtraTranslation(dto: ExtraTranslationDTO): Promise<Translation> {
		const lexicon = await this.lexiconService.findById(dto.wordId);
		if (!lexicon) throw new Error('Lexique introuvable');

		const existing = await this.translationRepo.findOne({
			where: {
				source: dto.sourceText.toLowerCase(),
				target: dto.translation,
				sourceLang: dto.sourceLang,
				targetLang: dto.targetLang
			}
		});

		if (existing) return existing;

		const newEntry = this.translationRepo.create({
			source: dto.sourceText.toLowerCase(),
			target: dto.translation,
			sourceLang: dto.sourceLang,
			targetLang: dto.targetLang,
			meaning: 'manual',
			lexicon
		});

		return await this.translationRepo.save(newEntry);
	}

	async updateTranslation(dto: UpdateTranslationDTO): Promise<Translation> {
		const translation = await this.translationRepo.findOneBy({ id: dto.translationId });
		if (!translation) throw new Error('Traduction introuvable');

		translation.target = dto.newTranslation;
		return this.translationRepo.save(translation);
	}

	async updateExamples(id: number, examples: string[]) {
		const translation = await this.translationRepo.findOne({
			where: { id },
			relations: ['examples'] // nécessaire pour supprimer les anciens exemples
		});

		if (!translation) throw new NotFoundException('Translation not found');

		// on supprime les anciens exemples
		translation.examples = [];

		// on ajoute les nouveaux
		translation.examples = examples.map(sentence => {
			const example = new Example();
			example.sentence = sentence;
			example.translation = translation;
			return example;
		});

		// TODO : optimiser cette logique avec une transaction
		return await this.translationRepo.save(translation);
	}


}
