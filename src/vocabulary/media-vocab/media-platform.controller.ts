import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { MediaPlatformService } from './media-platform.service';
import { CreateMediaPlatformDto } from './dto/create-media-platform.dto';

// 📱 ========== CONTROLLER ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
// Этот контроллер используется ТОЛЬКО в Flutter приложении
// НЕ используется в Angular приложении

@Controller('media-platforms')
export class MediaPlatformController {
	constructor(private readonly mediaPlatformService: MediaPlatformService) {}

	/**
	 * 📱 [MOBILE APP ONLY] Получить все платформы пользователя
	 */
	@Get()
	async getAllPlatforms(@Req() req: any) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] GET /media-platforms для userId=${userId}`);
		return this.mediaPlatformService.getAllPlatforms(userId);
	}

	/**
	 * 📱 [MOBILE APP ONLY] Получить платформы по типу медиа
	 */
	@Get('by-type')
	async getPlatformsByType(
		@Query('mediaType') mediaType: string,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] GET /media-platforms/by-type?mediaType=${mediaType}, userId=${userId}`);
		return this.mediaPlatformService.getPlatformsByMediaType(mediaType, userId);
	}

	/**
	 * 📱 [MOBILE APP ONLY] Создать новую платформу
	 */
	@Post()
	async createPlatform(
		@Body() dto: CreateMediaPlatformDto,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] POST /media-platforms, userId=${userId}`, dto);
		return this.mediaPlatformService.createPlatform(dto, userId);
	}

	/**
	 * 📱 [MOBILE APP ONLY] Удалить платформу
	 */
	@Delete(':id')
	async deletePlatform(
		@Param('id') id: number,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log(`📱 [MOBILE APP] DELETE /media-platforms/${id}, userId=${userId}`);
		await this.mediaPlatformService.deletePlatform(+id, userId);
		return { success: true };
	}
}





