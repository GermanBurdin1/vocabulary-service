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
		@Req() req: any
	) {
		const userId = req.user?.sub;
		return this.lexiconService.getAllByGalaxyAndSubtopic(galaxy, subtopic, userId);
	}

	@Post()
	async addOne(@Body() body: Partial<Lexicon>, @Req() req: any) {
		const userId = req.user?.sub;
		return this.lexiconService.addOne(body, userId);
	}

	@Post('bulk')
	async addMany(@Body() body: Partial<Lexicon>[], @Req() req: any) {
		const userId = req.user?.sub;
		return this.lexiconService.addMany(body, userId);
	}

	@Patch(':id/mark-translated')
	async markTranslated(@Param('id') id: number, @Req() req: any) {
		const userId = req.user?.sub;
		return this.lexiconService.markAsTranslated(Number(id), userId);
	}

	@Patch(':id/status')
	updateStatus(
		@Param('id') id: number,
		@Body() dto: UpdateLexiconStatusDto,
		@Req() req: any
	) {
		const userId = req.user?.sub;
		return this.lexiconService.updateStatus(id, dto.status, userId);
	}

	@Patch(':id/reveal')
	updateRevealed(@Param('id') id: number, @Req() req: any) {
		const userId = req.user?.sub;
		return this.lexiconService.updateRevealed(+id, true, userId);
	}

	@Delete(':id')
	async deleteWord(@Param('id') id: number, @Req() req: any) {
		const userId = req.user?.sub;
		return this.lexiconService.deleteWord(+id, userId);
	}

	// ==================== ENDPOINT ДЛЯ СТАТИСТИКИ ====================

	/**
	 * Получить количество изученных слов для пользователя
	 */
	@Get('learned/count')
	async getLearnedWordsCount(@Req() req: any) {
		const userId = req.user?.sub;
		console.log(`📊 [GET] /learned/count получен для пользователя ${userId}`);
		const count = await this.lexiconService.getLearnedWordsCount(userId);
		return { count };
	}

}
