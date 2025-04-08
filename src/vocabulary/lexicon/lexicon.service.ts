import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lexicon } from './lexicon.entity';

@Injectable()
export class LexiconService {
  constructor(
    @InjectRepository(Lexicon)
    private lexiconRepo: Repository<Lexicon>,
  ) {}

  async addOne(wordData: Partial<Lexicon>): Promise<Lexicon> {
		const word = this.lexiconRepo.create({
			...wordData,
			createdAt: Date.now(),
			translated: false, // 👈 добавлено
		});
		return this.lexiconRepo.save(word);
	}
	
	async addMany(words: Partial<Lexicon>[]): Promise<Lexicon[]> {
		const wordEntities = words.map(data =>
			this.lexiconRepo.create({
				...data,
				createdAt: Date.now(),
				translated: false, // 👈 добавлено
			}),
		);
		return this.lexiconRepo.save(wordEntities);
	}	

	async markAsTranslated(id: number): Promise<void> {
		await this.lexiconRepo.update(id, { translated: true });
	}
	
}
