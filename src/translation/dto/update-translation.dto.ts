import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';
export class UpdateTranslationDTO {
  @IsNumber()
  translationId: number;

  @IsString()
  @IsNotEmpty()
  newTranslation: string;
}
