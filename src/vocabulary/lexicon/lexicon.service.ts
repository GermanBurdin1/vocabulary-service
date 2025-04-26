import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lexicon } from './lexicon.entity';
import { Grammar } from 'src/grammar/grammar.entity';

@Injectable()
export class LexiconService {
	constructor(
		@InjectRepository(Lexicon)
		private lexiconRepo: Repository<Lexicon>,
		@InjectRepository(Grammar)
		private readonly grammarRepo: Repository<Grammar>,
	) { }

	async addOne(wordData: Partial<Lexicon>): Promise<Lexicon> {
		let grammarEntity = null;

		if (wordData.grammar) {
			// если есть grammar — сначала сохраняем грамматическую сущность
			grammarEntity = this.grammarRepo.create(wordData.grammar);
			grammarEntity = await this.grammarRepo.save(grammarEntity);
			console.log('📚 Грамматика сохранена:', grammarEntity);
		}

		const word = this.lexiconRepo.create({
			...wordData,
			grammar: grammarEntity ?? undefined, // сюда подставляем уже сохранённую грамматику
			createdAt: Date.now(),
			translated: false,
		});

		console.log('🛠 Создана сущность Lexicon:', word);

		const saved = await this.lexiconRepo.save(word);
		console.log('💾 Сохранено в БД:', saved);

		return saved;
	}


	async updateOne(id: number, data: Partial<Lexicon>) {
		await this.lexiconRepo.update({ id }, data);
		return this.lexiconRepo.findOne({ where: { id } });
	}


	async addMany(words: Partial<Lexicon>[]): Promise<Lexicon[]> {
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
			});
	
			const saved = await this.lexiconRepo.save(word);
			console.log('💾 Слово сохранено:', saved);
	
			savedWords.push(saved);
		}
	
		return savedWords;
	}
	


	async markAsTranslated(id: number): Promise<void> {
		await this.lexiconRepo.update(id, { translated: true });
	}

	async getAllByGalaxyAndSubtopic(galaxy: string, subtopic: string): Promise<Lexicon[]> {
		const result = await this.lexiconRepo.find({
			where: { galaxy, subtopic },
			relations: ['translations'],
			order: { createdAt: 'DESC' },
		});
		return result;
	}

	async findByWord(word: string): Promise<Lexicon | null> {
		return this.lexiconRepo.findOne({ where: { word } });
	}

	async updateStatus(id: number, status: 'learned' | 'repeat' | null) {
		const word = await this.lexiconRepo.findOneBy({ id });
		if (!word) throw new NotFoundException('Word not found');
		word.status = status;
		return this.lexiconRepo.save(word);
	}

	async findById(id: number): Promise<Lexicon | null> {
		return await this.lexiconRepo.findOne({ where: { id } });
	}

	async updateRevealed(id: number, revealed: boolean): Promise<Lexicon> {
		return this.lexiconRepo.update({ id }, { revealed }).then(() =>
			this.lexiconRepo.findOne({ where: { id } })
		);
	}


}
