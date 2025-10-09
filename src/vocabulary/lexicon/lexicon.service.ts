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


}
