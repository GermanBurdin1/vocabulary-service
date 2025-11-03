import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// 📱 ========== ENTITY ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
// Эта сущность используется ТОЛЬКО в Flutter приложении
// НЕ используется в Angular приложении
// Представляет собой медиа-платформу (соц сеть, стриминг-сервис и т.д.)

/**
 * 📱 [MOBILE APP ONLY] Медиа-платформа
 * 
 * Представляет "планету" в медиа-галактике:
 * - Для фильмов: Netflix, Amazon Prime, Disney+ и т.д.
 * - Для сериалов: Netflix, HBO, etc.
 * - Для музыки: Spotify, Apple Music, YouTube Music и т.д.
 * - Для подкастов: Apple Podcasts, Spotify, etc.
 */
@Entity('media_platforms')
export class MediaPlatform {
	@PrimaryGeneratedColumn()
	id: number;

	// ID пользователя, которому принадлежит эта платформа
	@Column()
	userId: string;

	// Тип медиа: 'films', 'series', 'music', 'podcasts'
	@Column()
	mediaType: string;

	// Название платформы (например: "Netflix", "Spotify")
	@Column()
	name: string;

	// Иконка платформы (эмодзи или имя иконки)
	@Column({ nullable: true })
	icon?: string;

	@CreateDateColumn()
	createdAt: Date;
}





