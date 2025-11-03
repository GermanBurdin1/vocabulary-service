import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaContent } from './media-content.entity';
import { CreateMediaContentDto } from './dto/create-media-content.dto';

// 📱 ========== SERVICE ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
// Этот сервис используется ТОЛЬКО в Flutter приложении
// НЕ используется в Angular приложении

@Injectable()
export class MediaContentService {
	constructor(
		@InjectRepository(MediaContent)
		private mediaContentRepo: Repository<MediaContent>,
	) {}

	/**
	 * 📱 [MOBILE APP ONLY] Получить весь контент пользователя для типа медиа
	 */
	async getContentByMediaType(mediaType: string, userId: string): Promise<MediaContent[]> {
		console.log(`📱 [MOBILE APP] Получение контента для mediaType="${mediaType}", userId=${userId}`);
		
		return this.mediaContentRepo.find({
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
	 * 📱 [MOBILE APP ONLY] Создать новый контент
	 */
	async createContent(dto: CreateMediaContentDto, userId: string): Promise<MediaContent> {
		console.log(`📱 [MOBILE APP] Создание контента:`, dto);
		
		const content = this.mediaContentRepo.create({
			...dto,
			userId
		});

		const saved = await this.mediaContentRepo.save(content);
		console.log(`📱 [MOBILE APP] Контент создан с id=${saved.id}`);
		return saved;
	}

	/**
	 * 📱 [MOBILE APP ONLY] Удалить контент
	 */
	async deleteContent(id: number, userId: string): Promise<void> {
		console.log(`📱 [MOBILE APP] Удаление контента id=${id}, userId=${userId}`);
		
		await this.mediaContentRepo.delete({ id, userId });
	}

	/**
	 * 📱 [MOBILE APP ONLY] Обновить контент
	 */
	async updateContent(id: number, dto: Partial<CreateMediaContentDto>, userId: string): Promise<MediaContent> {
		console.log(`📱 [MOBILE APP] Обновление контента id=${id}:`, dto);
		
		await this.mediaContentRepo.update({ id, userId }, dto);
		
		const updated = await this.mediaContentRepo.findOne({ where: { id, userId } });
		if (!updated) {
			throw new Error('Content not found');
		}
		
		return updated;
	}
}





