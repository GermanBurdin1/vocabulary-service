import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { MediaContentService } from './media-content.service';
import { CreateMediaContentDto } from './dto/create-media-content.dto';

// 📱 ========== CONTROLLER ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
// Этот контроллер используется ТОЛЬКО в Flutter приложении
// НЕ используется в Angular приложении

@Controller('media-content')
export class MediaContentController {
	constructor(private readonly mediaContentService: MediaContentService) {}

	/**
	 * 📱 [MOBILE APP ONLY] Получить весь контент по типу медиа
	 */
	@Get()
	async getContentByType(
		@Query('mediaType') mediaType: string,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] GET /media-content?mediaType=${mediaType}, userId=${userId}`);
		return this.mediaContentService.getContentByMediaType(mediaType, userId);
	}

	/**
	 * 📱 [MOBILE APP ONLY] Создать новый контент
	 */
	@Post()
	async createContent(
		@Body() dto: CreateMediaContentDto,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] POST /media-content, userId=${userId}`, dto);
		return this.mediaContentService.createContent(dto, userId);
	}

	/**
	 * 📱 [MOBILE APP ONLY] Обновить контент
	 */
	@Patch(':id')
	async updateContent(
		@Param('id') id: number,
		@Body() dto: Partial<CreateMediaContentDto>,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] PATCH /media-content/${id}, userId=${userId}`, dto);
		return this.mediaContentService.updateContent(+id, dto, userId);
	}

	/**
	 * 📱 [MOBILE APP ONLY] Удалить контент
	 */
	@Delete(':id')
	async deleteContent(
		@Param('id') id: number,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] DELETE /media-content/${id}, userId=${userId}`);
		await this.mediaContentService.deleteContent(+id, userId);
		return { success: true };
	}
}





