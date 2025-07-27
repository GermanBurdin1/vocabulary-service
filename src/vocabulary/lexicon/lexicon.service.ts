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
	async addOne(wordData: Partial<Lexicon>): Promise<Lexicon> {
		let grammarEntity = null;

		if (wordData.grammar) {
			grammarEntity = this.grammarRepo.create(wordData.grammar);
			grammarEntity = await this.grammarRepo.save(grammarEntity);
			console.log('[LexiconService] Grammaire sauvegardée:', grammarEntity);
		}

		const word = this.lexiconRepo.create({
			...wordData,
			grammar: grammarEntity ?? undefined,
			createdAt: Date.now(),
			translated: wordData.translations && wordData.translations.length > 0 ? true : false,
			postponed: wordData.postponed ?? false, 
			userId: wordData.userId || null, // on ajoute l'userId
		});

		console.log('[LexiconService] Entité Lexicon créée avec userId:', word.userId, word);

		const saved = await this.lexiconRepo.save(word);
		console.log('[LexiconService] Sauvegardé en BDD:', saved);
		console.log("wordData.translations", wordData.translations);

		// maintenant on vérifie s'il y a des traductions et on met à jour
		if (wordData.translations && wordData.translations.length > 0) {
			const translations = wordData.translations.map(t => this.translationRepo.create({
				source: t.source ?? '',
				target: t.target,
				sourceLang: t.sourceLang ?? 'fr',
				targetLang: t.targetLang ?? 'ru',
				meaning: t.meaning ?? '',
				example: t.example ?? null,
				lexicon: saved, // important : lexicon et pas lexiconId
			}));

			await this.translationRepo.save(translations);
			console.log('[LexiconService] Traductions sauvegardées:', translations);

			// log : combien sont réellement sauvegardées en base
			const savedTranslations = await this.translationRepo.find({ where: { lexicon: { id: saved.id } } });
			console.log('[LexiconService] Vérification après sauvegarde: réellement en BDD traductions:', savedTranslations.length);


			await this.lexiconRepo.update(saved.id, { translated: true });
			saved.translated = true;
		}

		// important : on recharge avec les relations
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
	async addMany(words: Partial<Lexicon>[]): Promise<Lexicon[]> {
		const savedWords: Lexicon[] = [];

		for (const wordData of words) {
			let grammarEntity = null;

			// on sauvegarde la grammaire si elle existe
			if (wordData.grammar) {
				grammarEntity = this.grammarRepo.create(wordData.grammar);
				grammarEntity = await this.grammarRepo.save(grammarEntity);
				console.log('[LexiconService] Grammaire sauvegardée:', grammarEntity);
			}

			const word = this.lexiconRepo.create({
				...wordData,
				grammar: grammarEntity ?? undefined, // si on a une grammaire sauvée on l'attache
				createdAt: Date.now(),
				translated: false,
				postponed: wordData.postponed ?? false, 
				userId: wordData.userId || null, // on ajoute l'userId
			});

			const saved = await this.lexiconRepo.save(word);
			console.log('[LexiconService] Mot sauvegardé:', saved);

			savedWords.push(saved);
		}

		return savedWords;
	}



	async markAsTranslated(id: number): Promise<void> {
		await this.lexiconRepo.update(id, { translated: true });
	}

	async getAllByGalaxyAndSubtopic(galaxy: string, subtopic: string, userId?: string): Promise<Lexicon[]> {
		const whereConditions: any = { galaxy, subtopic };
		
		// si userId est fourni, on l'ajoute aux conditions de recherche
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


	async deleteWord(id: number): Promise<DeleteResult> {
		const word = await this.lexiconRepo.findOne({
			where: { id },
			relations: ['grammar', 'translations'],
		});

		if (!word) {
			throw new NotFoundException(`Word with id ${id} not found`);
		}

		// on supprime les traductions s'il y en a
		if (word.translations && word.translations.length > 0) {
			await this.translationRepo.delete({ lexicon: { id: word.id } });
			console.log(`[LexiconService] Supprimé ${word.translations.length} traductions pour mot id=${id}`);
		}

		// on supprime la grammaire s'il y en a une
		if (word.grammar) {
			await this.grammarRepo.delete(word.grammar.id);
			console.log(`[LexiconService] Grammaire supprimée id=${word.grammar.id}`);
		}

		// on supprime la carte elle-même
		const result = await this.lexiconRepo.delete(id);
		console.log(`[LexiconService] Mot supprimé id=${id}`);

		return result;
	}

	// ==================== MÉTHODES POUR STATISTIQUES ====================

	/**
	 * Récupérer le nombre de mots appris pour un utilisateur
	 */
	async getLearnedWordsCount(userId: string): Promise<number> {
		console.log(`[LexiconService] Calcul mots appris pour utilisateur: ${userId}`);
		
		// on vérifie que userId n'est pas vide
		if (!userId || userId === 'undefined' || userId === 'null') {
			console.warn('[LexiconService] userId vide ou invalide:', userId);
			return 0;
		}
		
		const count = await this.lexiconRepo.count({
			where: {
				userId,
				status: 'learned'
			}
		});

		console.log(`[LexiconService] Trouvé ${count} mots appris pour utilisateur ${userId}`);
		// TODO : ajouter un cache pour éviter les calculs répétés
		return count;
	}


}
