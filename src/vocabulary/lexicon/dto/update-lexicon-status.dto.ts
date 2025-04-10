import { IsIn } from 'class-validator';

export class UpdateLexiconStatusDto {
  @IsIn(['learned', 'repeat', null])
  status: 'learned' | 'repeat' | null;
}
