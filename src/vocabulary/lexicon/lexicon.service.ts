import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lexicon } from './lexicon.entity';

@Injectable()
export class LexiconService {
	constructor(
		@InjectRepository(Lexicon)
		private lexiconRepo: Repository<Lexicon>,
	) { }

	async addOne(wordData: Partial<Lexicon>): Promise<Lexicon> {
		const word = this.lexiconRepo.create({
			...wordData,
			createdAt: Date.now(),
			translated: false, 
		});
		return this.lexiconRepo.save(word);
	}

	async addMany(words: Partial<Lexicon>[]): Promise<Lexicon[]> {
		const wordEntities = words.map(data =>
			this.lexiconRepo.create({
				...data,
				createdAt: Date.now(),
				translated: false, 
			}),
		);
		return this.lexiconRepo.save(wordEntities);
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


}
