import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrammarData } from './dto/grammar-data.dto';
import { Grammar } from './grammar.entity'; // твоя сущность Grammar
import { Lexicon } from '../vocabulary/lexicon/lexicon.entity'; // если нужно связать с карточкой

@Injectable()
export class GrammarService {
  constructor(
    @InjectRepository(Grammar)
    private grammarRepository: Repository<Grammar>,

    @InjectRepository(Lexicon)
    private lexiconRepository: Repository<Lexicon>
  ) {}

  async updateGrammar(wordId: number, data: GrammarData, userId?: string) {
		const word = await this.lexiconRepository.findOne({ where: { id: wordId } });
		if (!word) throw new Error('Слово не найдено');
		
		// Проверяем владение, если передан userId
		if (userId && word.userId !== userId) {
			throw new Error('Unauthorized: You can only update grammar for your own words');
		}
	
		let grammar = await this.grammarRepository.findOne({
			where: {
				lexicon: { id: word.id }
			}
		});		
	
		const payload = {
			...data,
			lexicon: word, 
		};
	
		if (grammar) {
			await this.grammarRepository.update(grammar.id, payload); // ✅ обновляем по id
			grammar = await this.grammarRepository.findOne({ where: { id: grammar.id } }); // повторно получаем
		} else {
			grammar = this.grammarRepository.create(payload); // ✅ создаём
			await this.grammarRepository.save(grammar);
		}
	
		return { message: 'Грамматика обновлена', grammar };
	}
	
}
