import { Injectable } from '@nestjs/common';
import { Translation } from './translation.entity';
import { TranslationStats } from './translation-stats.entity';
import { WiktionaryReader } from './wiktionary.reader';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class TranslationService {
	constructor(private configService: ConfigService,
		@InjectRepository(Translation)
		private readonly translationRepo: Repository<Translation>,
		@InjectRepository(TranslationStats)
		private readonly statsRepo: Repository<TranslationStats>,) { }
	private readonly wiktionary = new WiktionaryReader();
	private deeplCallTimestamps: number[] = []; // в ms
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

		// Удаляем старые запросы
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
			console.log(`🟢 Перевод от DeepL: ${translated}`);
			return translated ? [translated] : [];
		} catch (error) {
			console.error('❌ Ошибка при обращении к DeepL API:', error.message);
			return [];
		}
	}


	async addTranslation(translation: Omit<Translation, 'id'>): Promise<Translation> {
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
			source: translation.source.toLowerCase(), // для надёжности
		});
		return this.translationRepo.save(newEntry);
	}


	async findBySource(
		source: string,
		sourceLang: 'ru' | 'fr' | 'en',
		targetLang: 'ru' | 'fr' | 'en'
	): Promise<{
		word: string;
		translations: string[];
		sourceLang: string;
		targetLang: string;
		from: 'wiktionary' | 'api' | 'cache';
	}> {
		// 1. Поиск в базе как в кэше
		const existing = await this.translationRepo.findOne({
			where: {
				source: source.toLowerCase(),
				sourceLang,
				targetLang,
			},
		});

		if (existing) {
			this.stats.cache++; // 👈
			return {
				word: source,
				translations: [existing.target],
				sourceLang,
				targetLang,
				from: 'cache',
			};
		}		

		// 2. Попытка найти в Wiktionary
		if (sourceLang === 'fr' && (targetLang === 'ru' || targetLang === 'en')) {
			const wiktionaryResults = await this.wiktionary.find(source, targetLang);
			if (wiktionaryResults.length > 0) {
				const translationsFromDict = wiktionaryResults.flatMap(entry =>
					entry.translations.map(t => t.word)
				);

				if (translationsFromDict[0]) {
					this.stats.wiktionary++;
					await this.addTranslation({
						source,
						target: translationsFromDict[0],
						sourceLang,
						targetLang,
						meaning: 'wiktionary',
					});
				}

				return {
					word: source,
					translations: translationsFromDict,
					sourceLang,
					targetLang,
					from: 'wiktionary',
				};
			}
		}

		// 3. Если ничего не найдено — DeepL
		const apiResults = await this.translateViaApi(source, sourceLang, targetLang);

		if (apiResults[0]) {
			this.stats.api++; 
			await this.addTranslation({
				source,
				target: apiResults[0],
				sourceLang,
				targetLang,
				meaning: 'deepl',
			});
		}

		return {
			word: source,
			translations: apiResults,
			sourceLang,
			targetLang,
			from: 'api',
		};
	}

}
