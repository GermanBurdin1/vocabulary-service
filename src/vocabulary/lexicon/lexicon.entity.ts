import { Translation } from 'src/translation/translation.entity';
import { Grammar } from 'src/grammar/grammar.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from 'typeorm';

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

	// 📱 [MOBILE APP ONLY] Поля для медиа-словаря Flutter приложения
	@Column({ nullable: true })
	mediaType?: string; // 'films', 'series', 'music', 'podcasts'

	@Column({ nullable: true })
	mediaPlatform?: string; // 'Netflix', 'Spotify', etc. (для классификации по платформам)

	@Column({ nullable: true })
	mediaContentTitle?: string; // 'Dexter', 'Inception', etc. (для классификации по контенту)

	// Временные метки (опционально)
	@Column({ nullable: true })
	season?: number; // Сезон (для сериалов)

	@Column({ nullable: true })
	episode?: number; // Серия (для сериалов)

	@Column({ nullable: true })
	timestamp?: string; // Временная метка: "12:34" или "1:23:45" (минута:секунда или час:минута:секунда)

	// 📱 [MOBILE APP ONLY] Дополнительные поля для медиа-контента
	@Column({ nullable: true })
	genre?: string; // Жанр (films/series)

	@Column({ nullable: true })
	year?: number; // Год выпуска (films/series/music)

	@Column({ nullable: true })
	director?: string; // Режиссер (films/series)

	@Column({ nullable: true })
	host?: string; // Ведущий (podcasts)

	@Column({ nullable: true })
	guests?: string; // Приглашенные (podcasts)

	@Column({ nullable: true })
	album?: string; // Альбом (music)

	@Column({ type: 'bigint' })
	createdAt: number;

	/**
	 * ID пользователя, которому принадлежит это слово
	 */
	@Column({ nullable: true })
	userId: string;

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

	@Column({ default: false })
	postponed: boolean;

	@OneToOne(() => Grammar, (grammar) => grammar.lexicon, { cascade: false, nullable: true })
grammar?: Grammar;


}
