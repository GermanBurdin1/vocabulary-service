import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';
import { Public } from '../auth/public.decorator';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Public()
  @Post('recognize')
  @UseInterceptors(FileInterceptor('audio'))
  async recognizeSpeech(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Аудио файл не предоставлен');
    }

    const recognizedText = await this.speechService.recognizeAudio(
      file.buffer,
      file.mimetype,
    );

    return {
      text: recognizedText,
      success: true,
    };
  }
}







