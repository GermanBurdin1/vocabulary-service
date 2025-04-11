import { Translation } from 'src/translation/translation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Lexicon {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToMany(() => Translation, (translation) => translation.lexicon)
	translations: Translation[];

	@Column()
	word: string;

	@Column()
	translated: boolean;

	@Column()
	type: 'word' | 'expression';

	@Column()
	galaxy: string;

	@Column()
	subtopic: string;

	@Column({ type: 'bigint' })
	createdAt: number;

	/**
 * Статус карточки:
 * - 'learned' — слово выучено, студент успешно перевёл.
 * - 'repeat' — слово отмечено как нуждающееся в повторении.
 * - 'error' — студент неоднократно ошибался при переводе этого слова.
 * - null — слово ещё не проверялось и не классифицировалось (новое по умолчанию)
 */
	@Column({ nullable: true })
	status: 'learned' | 'repeat' | 'error' | null;

	@Column({ default: false })
	revealed: boolean;


}
