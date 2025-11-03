import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { Lexicon } from './lexicon.entity';
import { Grammar } from 'src/grammar/grammar.entity';
import { Translation } from 'src/translation/translation.entity';

@Injectable()
export class LexiconService {
	constructor(
		@InjectRepository(Lexicon)
		private lexiconRepo: Repository<Lexicon>,
		@InjectRepository(Grammar)
		private readonly grammarRepo: Repository<Grammar>,
		@InjectRepository(Translation) private readonly translationRepo: Repository<Translation>
	) { }

	/**
	 * Save a single word in the lexicon.
	 * @param wordData The word data to save.
	 * @returns The saved word.
	 */
	async addOne(wordData: Partial<Lexicon>, userId: string): Promise<Lexicon> {
		let grammarEntity = null;

		if (wordData.grammar) {
			grammarEntity = this.grammarRepo.create(wordData.grammar);
			grammarEntity = await this.grammarRepo.save(grammarEntity);
			console.log('📚 Грамматика сохранена:', grammarEntity);
		}

		const word = this.lexiconRepo.create({
			...wordData,
			grammar: grammarEntity ?? undefined,
			createdAt: Date.now(),
			translated: wordData.translations && wordData.translations.length > 0 ? true : false,
			postponed: wordData.postponed ?? false, // << 🆕
			userId: userId, // 🆕 Используем userId из параметра
		});

		console.log('🛠 Создана сущность Lexicon с userId:', word.userId, word);

		const saved = await this.lexiconRepo.save(word);
		console.log('💾 Сохранено в БД:', saved);
		console.log("wordData.translations", wordData.translations);

		// 🔥 Теперь смотрим, есть ли переводы, и ОБНОВЛЯЕМ
		if (wordData.translations && wordData.translations.length > 0) {
			const translations = wordData.translations.map(t => this.translationRepo.create({
				source: t.source ?? '',
				target: t.target,
				sourceLang: t.sourceLang ?? 'fr',
				targetLang: t.targetLang ?? 'ru',
				meaning: t.meaning ?? '',
				example: t.example ?? null,
				lexicon: saved, // ⬅️ ВАЖНО: не lexiconId, а lexicon
			}));

			await this.translationRepo.save(translations);
			console.log('✅ Переводы сохранены:', translations);

			// ➡️ ЛОГ: Сколько реально сохранилось в базе
			const savedTranslations = await this.translationRepo.find({ where: { lexicon: { id: saved.id } } });
			console.log('🔍 Проверка после сохранения: реально в БД переводов:', savedTranslations.length);


			await this.lexiconRepo.update(saved.id, { translated: true });
			saved.translated = true;
		}

		// 🛠 ВАЖНО: перезагружаем с relations
	const fullSaved = await this.lexiconRepo.findOne({
		where: { id: saved.id },
		relations: ['grammar', 'translations'],
	});

	return fullSaved!;
	}


	/**
	 * Update a single word in the lexicon.
	 * @param id ID of the word to update.
	 * @param data The data to update the word with.
	 * @returns The updated word.
	 */
	async updateOne(id: number, data: Partial<Lexicon>) {
		await this.lexiconRepo.update({ id }, data);
		return this.lexiconRepo.findOne({ where: { id } });
	}


	/**
	 * Save multiple words in the lexicon at once.
	 * @param words An array of word data to save.
	 * @returns An array of saved words.
	 */
	async addMany(words: Partial<Lexicon>[], userId: string): Promise<Lexicon[]> {
		const savedWords: Lexicon[] = [];

		for (const wordData of words) {
			let grammarEntity = null;

			// Сохраняем грамматику, если она есть
			if (wordData.grammar) {
				grammarEntity = this.grammarRepo.create(wordData.grammar);
				grammarEntity = await this.grammarRepo.save(grammarEntity);
				console.log('📚 Грамматика сохранена:', grammarEntity);
			}

			const word = this.lexiconRepo.create({
				...wordData,
				grammar: grammarEntity ?? undefined, // если есть сохранённая грамматика — привязываем
				createdAt: Date.now(),
				translated: false,
				postponed: wordData.postponed ?? false, // << 🆕
				userId: userId, // 🆕 Используем userId из параметра
			});

			const saved = await this.lexiconRepo.save(word);
			console.log('💾 Слово сохранено:', saved);

			savedWords.push(saved);
		}

		return savedWords;
	}



	async markAsTranslated(id: number, userId?: string): Promise<void> {
		// Проверяем владение, если передан userId
		if (userId) {
			const word = await this.lexiconRepo.findOne({ where: { id } });
			if (!word) {
				throw new NotFoundException('Word not found');
			}
			if (word.userId !== userId) {
				throw new Error('Unauthorized: You can only mark your own words as translated');
			}
		}
		
		await this.lexiconRepo.update(id, { translated: true });
	}

	async getAllByGalaxyAndSubtopic(galaxy: string, subtopic: string, userId?: string): Promise<Lexicon[]> {
		const whereConditions: any = { galaxy, subtopic };
		
		// Если userId передан, добавляем его в условия поиска
		if (userId) {
			whereConditions.userId = userId;
		}
		
		const result = await this.lexiconRepo.find({
			where: whereConditions,
			relations: ['translations', 'grammar'],
			order: { createdAt: 'DESC' },
		});
		return result;
	}

	async findByWord(word: string): Promise<Lexicon | null> {
		return this.lexiconRepo.findOne({ where: { word } });
	}

	async updateStatus(id: number, status: 'learned' | 'repeat' | null, userId?: string) {
		const word = await this.lexiconRepo.findOneBy({ id });
		if (!word) throw new NotFoundException('Word not found');
		
		// Проверяем владение, если передан userId
		if (userId && word.userId !== userId) {
			throw new Error('Unauthorized: You can only update your own words');
		}
		
		word.status = status;
		return this.lexiconRepo.save(word);
	}

	async findById(id: number): Promise<Lexicon | null> {
		return await this.lexiconRepo.findOne({ where: { id } });
	}

	async updateRevealed(id: number, revealed: boolean, userId?: string): Promise<Lexicon> {
		// Проверяем владение, если передан userId
		if (userId) {
			const word = await this.lexiconRepo.findOne({ where: { id } });
			if (!word) {
				throw new NotFoundException('Word not found');
			}
			if (word.userId !== userId) {
				throw new Error('Unauthorized: You can only update your own words');
			}
		}
		
		return this.lexiconRepo.update({ id }, { revealed }).then(() =>
			this.lexiconRepo.findOne({ where: { id } })
		);
	}


	async deleteWord(id: number, userId?: string): Promise<DeleteResult> {
		const word = await this.lexiconRepo.findOne({
			where: { id },
			relations: ['grammar', 'translations'],
		});

		if (!word) {
			throw new NotFoundException(`Word with id ${id} not found`);
		}

		// Проверяем владение, если передан userId
		if (userId && word.userId !== userId) {
			throw new Error('Unauthorized: You can only delete your own words');
		}

		// Удаляем переводы, если есть
		if (word.translations && word.translations.length > 0) {
			await this.translationRepo.delete({ lexicon: { id: word.id } });
			console.log(`🗑 Удалено переводов для слова id=${id}:`, word.translations.length);
		}

		// Удаляем грамматику, если есть
		if (word.grammar) {
			await this.grammarRepo.delete(word.grammar.id);
			console.log(`🗑 Удалена грамматика id=${word.grammar.id}`);
		}

		// Удаляем саму карточку
		const result = await this.lexiconRepo.delete(id);
		console.log(`🗑 Удалено слово id=${id}`);

		return result;
	}

	// ==================== МЕТОДЫ ДЛЯ СТАТИСТИКИ ====================

	/**
	 * Получить количество изученных слов для пользователя
	 */
	async getLearnedWordsCount(userId: string): Promise<number> {
		console.log(`📊 Подсчет изученных слов для пользователя: ${userId}`);
		
		// Проверяем что userId не пустой
		if (!userId || userId === 'undefined' || userId === 'null') {
			console.warn('⚠️ userId пустой или недействительный:', userId);
			return 0;
		}
		
		const count = await this.lexiconRepo.count({
			where: {
				userId,
				status: 'learned'
			}
		});

		console.log(`📊 Найдено изученных слов для пользователя ${userId}: ${count}`);
		return count;
	}

	// 📱 ========== МЕТОДЫ ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
	// Эти методы используются ТОЛЬКО в Flutter приложении
	// НЕ используются в Angular приложении
	// НЕ влияют на существующий функционал

	/**
	 * 📱 [MOBILE APP ONLY] Добавить слово для мобильного приложения
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Позволяет добавлять слова БЕЗ galaxy/subtopic (для медиа-контента)
	 * - Если передан mediaContentTitle, то galaxy и subtopic устанавливаются в пустую строку
	 * 
	 * @param wordData - данные слова
	 * @param userId - ID пользователя
	 */
	async addOneForMobile(wordData: Partial<Lexicon>, userId: string): Promise<Lexicon> {
		console.log('📱 [MOBILE APP] addOneForMobile called');
		console.log('📱 wordData:', wordData);
		console.log('📱 userId:', userId);

		let grammarEntity = null;

		if (wordData.grammar) {
			grammarEntity = this.grammarRepo.create(wordData.grammar);
			grammarEntity = await this.grammarRepo.save(grammarEntity);
			console.log('📱 [MOBILE APP] Грамматика сохранена:', grammarEntity);
		}

		// Сохраняем galaxy/subtopic, если они указаны (даже если есть mediaContentTitle)
		// Это позволяет связывать контент с темами (двустороннее связывание)
		const galaxy = wordData.galaxy || '';
		const subtopic = wordData.subtopic || '';

		const word = this.lexiconRepo.create({
			...wordData,
			galaxy,
			subtopic,
			grammar: grammarEntity ?? undefined,
			createdAt: Date.now(),
			translated: wordData.translations && wordData.translations.length > 0 ? true : false,
			postponed: wordData.postponed ?? false,
			userId: userId,
			// Дополнительные поля для медиа-контента
			genre: wordData.genre,
			year: wordData.year,
			director: wordData.director,
			host: wordData.host,
			guests: wordData.guests,
			album: wordData.album,
		});

		console.log('📱 [MOBILE APP] Создана сущность Lexicon:', word);

		const saved = await this.lexiconRepo.save(word);
		console.log('📱 [MOBILE APP] Сохранено в БД:', saved);

		// Обрабатываем переводы
		if (wordData.translations && wordData.translations.length > 0) {
			const translations = wordData.translations.map(t => this.translationRepo.create({
				source: t.source ?? '',
				target: t.target,
				sourceLang: t.sourceLang ?? 'fr',
				targetLang: t.targetLang ?? 'ru',
				meaning: t.meaning ?? '',
				example: t.example ?? null,
				lexicon: saved,
			}));

			const savedTranslations = await this.translationRepo.save(translations);
			console.log('📱 [MOBILE APP] Переводы сохранены:', savedTranslations);

			saved.translations = savedTranslations;
			saved.translated = true;
			await this.lexiconRepo.save(saved);
		}

		return saved;
	}

	/**
	 * 📱 [MOBILE APP ONLY] Обновить слово для мобильного приложения
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Обновляет существующее слово и его переводы
	 * - Если переданы переводы, они заменяют существующие
	 * 
	 * @param id - ID слова для обновления
	 * @param wordData - данные для обновления
	 * @param userId - ID пользователя
	 */
	async updateOneForMobile(id: number, wordData: Partial<Lexicon>, userId: string): Promise<Lexicon> {
		console.log('📱 [MOBILE APP] updateOneForMobile called');
		console.log('📱 id:', id);
		console.log('📱 wordData:', wordData);
		console.log('📱 userId:', userId);

		// Находим существующее слово
		const existingWord = await this.lexiconRepo.findOne({
			where: { id },
			relations: ['translations', 'grammar']
		});

		if (!existingWord) {
			throw new NotFoundException(`Word with id ${id} not found`);
		}

		// Проверяем владение
		if (existingWord.userId !== userId) {
			throw new Error('Unauthorized: You can only update your own words');
		}

		// Обновляем грамматику, если она передана
		let grammarEntity = existingWord.grammar;
		if (wordData.grammar) {
			if (grammarEntity) {
				// Обновляем существующую грамматику
				Object.assign(grammarEntity, wordData.grammar);
				grammarEntity = await this.grammarRepo.save(grammarEntity);
			} else {
				// Создаем новую грамматику
				grammarEntity = this.grammarRepo.create(wordData.grammar);
				grammarEntity = await this.grammarRepo.save(grammarEntity);
			}
			console.log('📱 [MOBILE APP] Грамматика обновлена:', grammarEntity);
		}

		// Подготавливаем данные для обновления
		const updateData: Partial<Lexicon> = {
			...wordData,
			grammar: grammarEntity ?? undefined,
		};

		// Удаляем translations из updateData, так как мы обработаем их отдельно
		delete updateData.translations;

		// Обновляем основные поля слова
		await this.lexiconRepo.update(id, updateData);

		// Обрабатываем переводы
		if (wordData.translations && wordData.translations.length > 0) {
			// Удаляем старые переводы
			if (existingWord.translations && existingWord.translations.length > 0) {
				await this.translationRepo.delete({ lexicon: { id } });
				console.log(`📱 [MOBILE APP] Удалено старых переводов: ${existingWord.translations.length}`);
			}

			// Создаем новые переводы
			const savedWord = await this.lexiconRepo.findOne({ where: { id } });
			if (savedWord) {
				const translations = wordData.translations.map(t => this.translationRepo.create({
					source: t.source ?? '',
					target: t.target,
					sourceLang: t.sourceLang ?? 'fr',
					targetLang: t.targetLang ?? 'ru',
					meaning: t.meaning ?? '',
					example: t.example ?? null,
					lexicon: savedWord,
				}));

				const savedTranslations = await this.translationRepo.save(translations);
				console.log('📱 [MOBILE APP] Переводы обновлены:', savedTranslations);

				// Обновляем флаг translated
				await this.lexiconRepo.update(id, { translated: true });
			}
		} else {
			// Если переводы не переданы, но слово было переведено, проверяем наличие переводов
			const existingTranslations = await this.translationRepo.find({ where: { lexicon: { id } } });
			if (existingTranslations.length === 0) {
				await this.lexiconRepo.update(id, { translated: false });
			}
		}

		// Возвращаем обновленное слово с relations
		const updatedWord = await this.lexiconRepo.findOne({
			where: { id },
			relations: ['translations', 'grammar'],
		});

		console.log('📱 [MOBILE APP] Слово обновлено:', updatedWord);
		return updatedWord!;
	}

	/**
	 * 📱 [MOBILE APP ONLY] Получить слова с фильтрацией по медиа-контенту
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Фильтрует слова по galaxy, subtopic, mediaType, mediaPlatform, mediaContentTitle
	 * - Если параметр не передан (undefined), он игнорируется в фильтрации
	 * 
	 * @param galaxy - название галактики (опционально)
	 * @param subtopic - название подтемы (опционально)
	 * @param mediaType - тип медиа (опционально)
	 * @param mediaPlatform - название платформы (опционально)
	 * @param mediaContentTitle - название контента (опционально)
	 * @param userId - ID пользователя (опционально)
	 */
	async getFilteredForMobile(
		galaxy?: string,
		subtopic?: string,
		mediaType?: string,
		mediaPlatform?: string,
		mediaContentTitle?: string,
		userId?: string
	): Promise<Lexicon[]> {
		console.log('📱 [MOBILE APP] getFilteredForMobile service called');
		console.log('📱 Parameters:', { galaxy, subtopic, mediaType, mediaPlatform, mediaContentTitle, userId });

		const whereConditions: any = {};

		// Добавляем условия только для переданных параметров
		if (galaxy !== undefined && galaxy !== null && galaxy !== '') {
			whereConditions.galaxy = galaxy;
		}
		if (subtopic !== undefined && subtopic !== null && subtopic !== '') {
			whereConditions.subtopic = subtopic;
		}
		if (mediaType !== undefined && mediaType !== null && mediaType !== '') {
			whereConditions.mediaType = mediaType;
		}
		if (mediaPlatform !== undefined && mediaPlatform !== null && mediaPlatform !== '') {
			whereConditions.mediaPlatform = mediaPlatform;
		}
		if (mediaContentTitle !== undefined && mediaContentTitle !== null && mediaContentTitle !== '') {
			whereConditions.mediaContentTitle = mediaContentTitle;
		}
		if (userId !== undefined && userId !== null && userId !== 'undefined' && userId !== 'null' && userId !== '') {
			whereConditions.userId = userId;
		}

		console.log('📱 [MOBILE APP] Where conditions:', whereConditions);

		const result = await this.lexiconRepo.find({
			where: whereConditions,
			relations: ['translations', 'grammar'],
			order: { createdAt: 'DESC' },
		});

		console.log(`📱 [MOBILE APP] Found ${result.length} words`);
		return result;
	}
	
	/**
	 * 📱 [MOBILE APP ONLY] Получить статистику по подтемам для галактики
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Группирует слова по подтемам и считает их количество
	 * - Разделяет переведённые и непереведённые
	 * 
	 * @param galaxy - название галактики
	 * @param userId - ID пользователя
	 * @returns массив с статистикой: [{ 
	 *   subtopic, 
	 *   totalWords, totalExpressions, total,
	 *   translatedWords, untranslatedWords,
	 *   translatedExpressions, untranslatedExpressions
	 * }]
	 */
	async getSubtopicsStatsForMobile(galaxy: string, userId: string) {
		console.log(`📱 [MOBILE APP] Получение статистики подтем для галактики "${galaxy}", userId: ${userId}`);
		
		if (!userId || userId === 'undefined' || userId === 'null') {
			console.warn('⚠️ [MOBILE APP] userId пустой или недействительный:', userId);
			return [];
		}

		// Получаем все слова пользователя для данной галактики
		const words = await this.lexiconRepo.find({
			where: {
				galaxy,
				userId
			},
			relations: ['translations'] // Загружаем переводы чтобы проверить translated
		});

		console.log(`📱 [MOBILE APP] Найдено ${words.length} слов для галактики "${galaxy}"`);

		// Группируем по подтемам и считаем слова/выражения + переведённые/непереведённые
		const statsMap = words.reduce((acc, word) => {
			const subtopic = word.subtopic || 'Без подтемы';
			
			if (!acc[subtopic]) {
				acc[subtopic] = {
					subtopic,
					totalWords: 0,
					totalExpressions: 0,
					total: 0,
					translatedWords: 0,
					untranslatedWords: 0,
					translatedExpressions: 0,
					untranslatedExpressions: 0
				};
			}

			const isTranslated = word.translated === true || (word.translations && word.translations.length > 0);

			// Считаем отдельно слова и выражения
			if (word.type === 'word') {
				acc[subtopic].totalWords += 1;
				if (isTranslated) {
					acc[subtopic].translatedWords += 1;
				} else {
					acc[subtopic].untranslatedWords += 1;
				}
			} else if (word.type === 'expression') {
				acc[subtopic].totalExpressions += 1;
				if (isTranslated) {
					acc[subtopic].translatedExpressions += 1;
				} else {
					acc[subtopic].untranslatedExpressions += 1;
				}
			}

			acc[subtopic].total += 1;

			return acc;
		}, {} as Record<string, { 
			subtopic: string; 
			totalWords: number; 
			totalExpressions: number; 
			total: number;
			translatedWords: number;
			untranslatedWords: number;
			translatedExpressions: number;
			untranslatedExpressions: number;
		}>);

		const result = Object.values(statsMap);
		console.log(`📱 [MOBILE APP] Статистика по ${result.length} подтемам:`, result);
		return result;
	}


}
