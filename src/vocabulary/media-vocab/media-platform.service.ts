import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaPlatform } from './media-platform.entity';
import { CreateMediaPlatformDto } from './dto/create-media-platform.dto';

// 📱 ========== SERVICE ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
// Этот сервис используется ТОЛЬКО в Flutter приложении
// НЕ используется в Angular приложении

@Injectable()
export class MediaPlatformService {
	constructor(
		@InjectRepository(MediaPlatform)
		private mediaPlatformRepo: Repository<MediaPlatform>,
	) {}

	/**
	 * 📱 [MOBILE APP ONLY] Получить все платформы пользователя для определенного типа медиа
	 */
	async getPlatformsByMediaType(mediaType: string, userId: string): Promise<MediaPlatform[]> {
		console.log(`📱 [MOBILE APP] Получение платформ для mediaType="${mediaType}", userId=${userId}`);
		
		return this.mediaPlatformRepo.find({
			where: {
				mediaType,
				userId
			},
			order: {
				createdAt: 'DESC'
			}
		});
	}

	/**
	 * 📱 [MOBILE APP ONLY] Получить все платформы пользователя
	 */
	async getAllPlatforms(userId: string): Promise<MediaPlatform[]> {
		console.log(`📱 [MOBILE APP] Получение всех платформ для userId=${userId}`);
		
		return this.mediaPlatformRepo.find({
			where: { userId },
			order: {
				mediaType: 'ASC',
				createdAt: 'DESC'
			}
		});
	}

	/**
	 * 📱 [MOBILE APP ONLY] Создать новую платформу
	 */
	async createPlatform(dto: CreateMediaPlatformDto, userId: string): Promise<MediaPlatform> {
		console.log(`📱 [MOBILE APP] Создание платформы:`, dto);
		
		const platform = this.mediaPlatformRepo.create({
			...dto,
			userId
		});

		const saved = await this.mediaPlatformRepo.save(platform);
		console.log(`📱 [MOBILE APP] Платформа создана с id=${saved.id}`);
		return saved;
	}

	/**
	 * 📱 [MOBILE APP ONLY] Удалить платформу
	 */
	async deletePlatform(id: number, userId: string): Promise<void> {
		console.log(`📱 [MOBILE APP] Удаление платформы id=${id}, userId=${userId}`);
		
		await this.mediaPlatformRepo.delete({ id, userId });
	}

	/**
	 * 📱 [MOBILE APP ONLY] Получить статистику по платформам
	 * (сколько слов/выражений в каждой платформе для данной темы)
	 */
	async getPlatformStats(mediaType: string, platformName: string, userId: string) {
		console.log(`📱 [MOBILE APP] Получение статистики для платформы="${platformName}", mediaType="${mediaType}"`);
		
		// TODO: реализовать подсчет слов когда добавим связь в Lexicon
		return {
			platformName,
			totalWords: 0,
			totalExpressions: 0,
			total: 0
		};
	}
}





