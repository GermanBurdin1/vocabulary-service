import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrammarData } from './dto/grammar-data.dto';
import { Grammar } from './grammar.entity'; // entité Grammar
import { Lexicon } from '../vocabulary/lexicon/lexicon.entity'; // si besoin de lier avec la carte

@Injectable()
export class GrammarService {
  constructor(
    @InjectRepository(Grammar)
    private grammarRepository: Repository<Grammar>,

    @InjectRepository(Lexicon)
    private lexiconRepository: Repository<Lexicon>
  ) {}

  async updateGrammar(wordId: number, data: GrammarData) {
		const word = await this.lexiconRepository.findOne({ where: { id: wordId } });
		if (!word) throw new Error('Mot introuvable');
	
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
			await this.grammarRepository.update(grammar.id, payload); // on met à jour par id
			grammar = await this.grammarRepository.findOne({ where: { id: grammar.id } }); // on récupère à nouveau
		} else {
			grammar = this.grammarRepository.create(payload); // on crée
			await this.grammarRepository.save(grammar);
		}
	
		// TODO : ajouter validation des données grammaticales
		return { message: 'Grammaire mise à jour', grammar };
	}
	
}
