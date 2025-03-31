import { Injectable } from '@nestjs/common';
import { Translation } from './translation.entity';
import { WiktionaryReader } from './wiktionary.reader';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';


@Injectable()
export class TranslationService {
	constructor(private configService: ConfigService) { }

	private translations: Translation[] = [];
	private idCounter = 1;
	private readonly wiktionary = new WiktionaryReader();
	private deeplCallTimestamps: number[] = []; // в ms
	private readonly DEEPL_LIMIT = 10;
	private readonly DEEPL_INTERVAL = 60 * 1000; // 1 минута


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


	addTranslation(translation: Omit<Translation, 'id'>): Translation {
		const existing = this.translations.find(
			(t) =>
				t.source === translation.source &&
				t.target === translation.target &&
				t.sourceLang === translation.sourceLang &&
				t.targetLang === translation.targetLang &&
				t.meaning === translation.meaning
		);

		if (existing) return existing;

		const newEntry = {
			id: this.idCounter++,
			...translation,
		};
		this.translations.push(newEntry);
		return newEntry;
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
		from: 'wiktionary' | 'api';
	}> {
		// 1. Пытаемся найти в Wiktionary
		if (sourceLang === 'fr' && (targetLang === 'ru' || targetLang === 'en')) {
			const wiktionaryResults = await this.wiktionary.find(source, targetLang);

			if (wiktionaryResults.length > 0) {
				const translationsFromDict: string[] = wiktionaryResults.flatMap((entry) =>
					entry.translations.map((t) => t.word)
				);

				return {
					word: source,
					translations: translationsFromDict,
					sourceLang,
					targetLang,
					from: 'wiktionary'
				};
			}
		}

		// 2. Если не найдено — обращаемся к внешнему API
		const apiResults = await this.translateViaApi(source, sourceLang, targetLang);

		return {
			word: source,
			translations: apiResults,
			sourceLang,
			targetLang,
			from: 'api'
		};
	}


}
