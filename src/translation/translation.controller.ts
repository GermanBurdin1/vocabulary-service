// translation.controller.ts
import {
	Controller,
	Post,
	Get,
	Body,
	Query,
	HttpException,
	Patch,
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
	async add(@Body() body: Omit<Translation, 'id'>): Promise<Translation> {
		return await this.service.addTranslation(body);
	}

	@Post('manual')
	async addManual(@Body() body: ManualTranslationDTO): Promise<Translation> {
		return await this.service.addManualTranslation(body);
	}

	@Get()
	async get(
		@Query('source') source: string,
		@Query('sourceLang') sourceLang: 'ru' | 'fr' | 'en',
		@Query('targetLang') targetLang: 'ru' | 'fr' | 'en'
	) {
		try {
			return await this.service.findBySource(source, sourceLang, targetLang);
		} catch (error) {
			if (error.message === 'RATE_LIMIT_EXCEEDED') {
				throw new HttpException('Превышен лимит переводов. Подождите минуту.', 429);
			}
			throw new HttpException('Ошибка при переводе', 500);
		}
	}

	@Get('stats')
	async getStats() {
		return this.service.getStats();
	}

	// POST /translation/extra
@Post('extra')
async addExtraTranslation(@Body() dto: ExtraTranslationDTO): Promise<Translation> {
  return this.service.addExtraTranslation(dto);
}

@Patch('edit')
async updateTranslation(@Body() dto: UpdateTranslationDTO): Promise<Translation> {
  return this.service.updateTranslation(dto);
}


}
