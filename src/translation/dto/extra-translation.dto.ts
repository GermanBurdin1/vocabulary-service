import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';

export class ExtraTranslationDTO {
  @IsNumber()
  wordId: number;

  @IsEnum(['ru', 'fr', 'en'])
  sourceLang: 'ru' | 'fr' | 'en';

  @IsEnum(['ru', 'fr', 'en'])
  targetLang: 'ru' | 'fr' | 'en';

  @IsString()
  @IsNotEmpty()
  sourceText: string;

  @IsString()
  @IsNotEmpty()
  translation: string;
}
