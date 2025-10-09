// translation.controller.ts
import {
	Controller,
	Post,
	Get,
	Body,
	Query,
	HttpException,
	Patch,
	Param,
	Req,
} from '@nestjs/common';
import { TranslationService } from './translation.service';
import { Translation } from './translation.entity';
import { ManualTranslationDTO } from './dto/manual-translation.dto';
import { ExtraTranslationDTO } from './dto/extra-translation.dto';
import { UpdateTranslationDTO } from './dto/update-translation.dto';

@Controller('translation')
export class TranslationController {
	constructor(private readonly service: TranslationService) { }

	@Post()
	async add(@Body() body: Omit<Translation, 'id'>, @Req() req: any): Promise<Translation> {
		const userId = req.user?.sub;
		return await this.service.addTranslation(body, userId);
	}

	@Post('manual')
	async addManual(@Body() body: ManualTranslationDTO, @Req() req: any): Promise<Translation> {
		const userId = req.user?.sub;
		return await this.service.addManualTranslation(body, userId);
	}

	@Get()
	/**
	 * Translate a word from one language to another.
	 *
	 * @queryParam source the word to translate
	 * @queryParam sourceLang the source language of the word (ru, fr, or en)
	 * @queryParam targetLang the language to translate to (ru, fr, or en)
	 *
	 * @throws {HttpException} 500 if the translation service fails
	 * @throws {HttpException} 429 if the translation service rate limit is exceeded
	 */
	async get(
		@Query('source') source: string,
		@Query('sourceLang') sourceLang: 'ru' | 'fr' | 'en',
		@Query('targetLang') targetLang: 'ru' | 'fr' | 'en',
		@Req() req: any
	) {
		try {
			const userId = req.user?.sub;
			return await this.service.findBySource(source, sourceLang, targetLang, userId);
		} catch (error) {
			if (error.message === 'RATE_LIMIT_EXCEEDED') {
				throw new HttpException('Превышен лимит переводов. Подождите минуту.', 429);
			}
			throw new HttpException('Ошибка при переводе', 500);
		}
	}

	@Get('stats')
	async getStats(@Req() req: any) {
		const userId = req.user?.sub;
		return this.service.getStats(userId);
	}

	// POST /translation/extra
@Post('extra')
async addExtraTranslation(@Body() dto: ExtraTranslationDTO, @Req() req: any): Promise<Translation> {
  const userId = req.user?.sub;
  return this.service.addExtraTranslation(dto, userId);
}

@Patch('edit')
async updateTranslation(@Body() dto: UpdateTranslationDTO, @Req() req: any): Promise<Translation> {
  const userId = req.user?.sub;
  return this.service.updateTranslation(dto, userId);
}

@Patch(':id/examples')
updateExamples(
  @Param('id') id: number,
  @Body('examples') examples: string[],
  @Req() req: any
) {
  const userId = req.user?.sub;
  return this.service.updateExamples(id, examples, userId);
}


}
