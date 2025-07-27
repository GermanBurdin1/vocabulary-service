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
	/**
	 * Traduit un mot d'une langue vers une autre.
	 *
	 * @queryParam source le mot à traduire
	 * @queryParam sourceLang la langue source du mot (ru, fr, ou en)
	 * @queryParam targetLang la langue de destination (ru, fr, ou en)
	 *
	 * @throws {HttpException} 500 si le service de traduction échoue
	 * @throws {HttpException} 429 si la limite de taux du service est dépassée
	 */
	async get(
		@Query('source') source: string,
		@Query('sourceLang') sourceLang: 'ru' | 'fr' | 'en',
		@Query('targetLang') targetLang: 'ru' | 'fr' | 'en'
	) {
		try {
			return await this.service.findBySource(source, sourceLang, targetLang);
		} catch (error) {
			if (error.message === 'RATE_LIMIT_EXCEEDED') {
				throw new HttpException('Limite de traduction dépassée. Veuillez patienter une minute.', 429);
			}
			throw new HttpException('Erreur lors de la traduction', 500);
		}
	}

	@Get('stats')
	async getStats() {
		// TODO : ajouter du cache pour éviter les calculs répétés
		return this.service.getStats();
	}

	// POST /translation/extra
@Post('extra')
async addExtraTranslation(@Body() dto: ExtraTranslationDTO): Promise<Translation> {
  return this.service.addExtraTranslation(dto);
}

@Patch('edit')
async updateTranslation(@Body() dto: UpdateTranslationDTO): Promise<Translation> {
  // TODO : ajouter validation des permissions utilisateur
  return this.service.updateTranslation(dto);
}

@Patch(':id/examples')
updateExamples(
  @Param('id') id: number,
  @Body('examples') examples: string[]
) {
  return this.service.updateExamples(id, examples);
}
}
