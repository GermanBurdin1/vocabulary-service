import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ManualTranslationDTO {
  @IsNumber()
  wordId: number;

  @IsEnum(['ru', 'fr', 'en'])
  sourceLang: 'ru' | 'fr' | 'en';

  @IsEnum(['ru', 'fr', 'en'])
  targetLang: 'ru' | 'fr' | 'en';

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  sourceText: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  translation: string;
}
