import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// 📱 ========== ENTITY ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
// Эта сущность используется ТОЛЬКО в Flutter приложении
// НЕ используется в Angular приложении
// Представляет собой конкретный медиа-контент (фильм, сериал, песню, подкаст)

/**
 * 📱 [MOBILE APP ONLY] Медиа-контент
 * 
 * Представляет конкретный медиа-объект:
 * - Для фильмов: "Inception", "The Matrix", etc.
 * - Для сериалов: "Dexter", "Breaking Bad", etc.
 * - Для музыки: "Bohemian Rhapsody", "Imagine", etc.
 * - Для подкастов: episode names, etc.
 */
@Entity('media_content')
export class MediaContent {
	@PrimaryGeneratedColumn()
	id: number;

	// ID пользователя, которому принадлежит этот контент
	@Column()
	userId: string;

	// Тип медиа: 'films', 'series', 'music', 'podcasts'
	@Column()
	mediaType: string;

	// Название контента (например: "Dexter", "Inception")
	@Column()
	title: string;

	// Иконка/эмодзи (опционально)
	@Column({ nullable: true })
	icon?: string;

	// Дополнительная информация (год, жанр и т.д.)
	@Column({ nullable: true })
	metadata?: string;

	@CreateDateColumn()
	createdAt: Date;
}





