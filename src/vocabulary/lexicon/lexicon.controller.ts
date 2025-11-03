import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { LexiconService } from './lexicon.service';
import { Lexicon } from './lexicon.entity';
import { UpdateLexiconStatusDto } from './dto/update-lexicon-status.dto';


@Controller('lexicon')
export class LexiconController {
	constructor(private readonly lexiconService: LexiconService) { }

	@Get()
	getByGalaxyAndSubtopic(
		@Query('galaxy') galaxy: string, 
		@Query('subtopic') subtopic: string,
		@Query('userId') userId?: string
	) {
		return this.lexiconService.getAllByGalaxyAndSubtopic(galaxy, subtopic, userId);
	}

	// 📱 ========== ENDPOINT ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
	// Этот эндпоинт используется ТОЛЬКО в Flutter приложении
	// НЕ используется в Angular приложении
	// НЕ влияет на существующий функционал
	/**
	 * 📱 [MOBILE APP ONLY] Получить слова с фильтрацией по медиа-контенту
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Фильтрует слова по mediaType, mediaPlatform, mediaContentTitle
	 * 
	 * @param galaxy - название галактики (опционально)
	 * @param subtopic - название подтемы (опционально)
	 * @param mediaType - тип медиа: films/series/music/podcasts (опционально)
	 * @param mediaPlatform - название платформы: Netflix/Spotify и т.д. (опционально)
	 * @param mediaContentTitle - название контента: Dexter/Inception и т.д. (опционально)
	 * @param userId - ID пользователя (опционально)
	 */
	@Get('mobile/filtered')
	getFilteredForMobile(
		@Query('galaxy') galaxy?: string,
		@Query('subtopic') subtopic?: string,
		@Query('mediaType') mediaType?: string,
		@Query('mediaPlatform') mediaPlatform?: string,
		@Query('mediaContentTitle') mediaContentTitle?: string,
		@Query('userId') userId?: string,
		@Query('genre') genre?: string,
		@Query('year') year?: string,
		@Query('director') director?: string,
		@Query('host') host?: string,
		@Query('guests') guests?: string,
		@Query('album') album?: string
	) {
		console.log('📱 [MOBILE APP] getFilteredForMobile called with:', {
			galaxy,
			subtopic,
			mediaType,
			mediaPlatform,
			mediaContentTitle,
			userId,
			genre,
			year,
			director,
			host,
			guests,
			album
		});
		
		// Парсим year из строки в число, если передан
		const yearNumber = year ? parseInt(year, 10) : undefined;
		
		return this.lexiconService.getFilteredForMobile(
			galaxy,
			subtopic,
			mediaType,
			mediaPlatform,
			mediaContentTitle,
			userId,
			genre,
			yearNumber,
			director,
			host,
			guests,
			album
		);
	}

	@Post()
	async addOne(@Body() body: Partial<Lexicon>, @Req() req: any) {
		const userId = req.user?.sub;
		return this.lexiconService.addOne(body, userId);
	}

	// 📱 [MOBILE APP ONLY] Добавить слово для мобильного приложения
	// Этот эндпоинт используется ТОЛЬКО в Flutter приложении
	// НЕ используется в Angular приложении
	// НЕ влияет на существующий функционал
	/**
	 * 📱 [MOBILE APP ONLY] Добавить слово для мобильного приложения
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Позволяет добавлять слова БЕЗ galaxy/subtopic (для медиа-контента)
	 */
	@Post('mobile/add')
	async addOneForMobile(@Body() body: Partial<Lexicon>, @Req() req: any) {
		const userId = req.user?.sub;
		console.log('📱 [MOBILE APP] POST /lexicon/mobile/add called');
		console.log('📱 body:', body);
		console.log('📱 userId:', userId);
		return this.lexiconService.addOneForMobile(body, userId);
	}

	// 📱 [MOBILE APP ONLY] Обновить слово для мобильного приложения
	// Этот эндпоинт используется ТОЛЬКО в Flutter приложении
	// НЕ используется в Angular приложении
	// НЕ влияет на существующий функционал
	/**
	 * 📱 [MOBILE APP ONLY] Обновить слово для мобильного приложения
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Обновляет существующее слово и его переводы
	 * - Если переданы переводы, они заменяют существующие
	 */
	@Patch('mobile/:id')
	async updateOneForMobile(
		@Param('id') id: number,
		@Body() body: Partial<Lexicon>,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log('📱 [MOBILE APP] PATCH /lexicon/mobile/:id called');
		console.log('📱 id:', id);
		console.log('📱 body:', body);
		console.log('📱 userId:', userId);
		return this.lexiconService.updateOneForMobile(+id, body, userId);
	}

	@Post('bulk')
	async addMany(@Body() body: Partial<Lexicon>[], @Req() req: any) {
		const userId = req.user?.sub;
		return this.lexiconService.addMany(body, userId);
	}

	@Patch(':id/mark-translated')
	async markTranslated(@Param('id') id: number) {
		return this.lexiconService.markAsTranslated(Number(id));
	}

	@Patch(':id/status')
	updateStatus(
		@Param('id') id: number,
		@Body() dto: UpdateLexiconStatusDto
	) {
		return this.lexiconService.updateStatus(id, dto.status);
	}

	@Patch(':id/reveal')
	updateRevealed(@Param('id') id: number) {
		return this.lexiconService.updateRevealed(+id, true);
	}

	@Delete(':id')
	async deleteWord(@Param('id') id: number) {
		return this.lexiconService.deleteWord(+id);
	}

	// 📱 [MOBILE APP ONLY] Удалить контент со всеми словами
	// Этот эндпоинт используется ТОЛЬКО в Flutter приложении
	// НЕ используется в Angular приложении
	// НЕ влияет на существующий функционал
	/**
	 * 📱 [MOBILE APP ONLY] Удалить контент со всеми словами
	 * 
	 * Этот метод:
	 * - Используется ТОЛЬКО в Flutter приложении
	 * - НЕ влияет на Angular приложение
	 * - Удаляет все слова для указанного контента
	 */
	@Delete('mobile/content')
	async deleteContentForMobile(
		@Query('mediaType') mediaType: string,
		@Query('mediaPlatform') mediaPlatform: string,
		@Query('mediaContentTitle') mediaContentTitle: string,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		console.log('📱 [MOBILE APP] DELETE /lexicon/mobile/content called');
		console.log('📱 Parameters:', { mediaType, mediaPlatform, mediaContentTitle, userId });
		return this.lexiconService.deleteContentForMobile(
			mediaType,
			mediaPlatform,
			mediaContentTitle,
			userId
		);
	}

	// ==================== ENDPOINT ДЛЯ СТАТИСТИКИ ====================

	/**
	 * Получить количество изученных слов для пользователя
	 */
	@Get('learned/count/:userId')
	async getLearnedWordsCount(@Param('userId') userId: string) {
		console.log(`📊 [GET] /learned/count/${userId} получен`);
		const count = await this.lexiconService.getLearnedWordsCount(userId);
		return { count };
	}

}
