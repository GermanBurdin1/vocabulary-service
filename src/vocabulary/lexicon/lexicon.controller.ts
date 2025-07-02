import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
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

	@Post()
	async addOne(@Body() body: Partial<Lexicon>) {
		return this.lexiconService.addOne(body);
	}

	@Post('bulk')
	async addMany(@Body() body: Partial<Lexicon>[]) {
		return this.lexiconService.addMany(body);
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
