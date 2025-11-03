import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);
  private groqClient: Groq | null = null;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groqClient = new Groq({ apiKey });
      this.logger.log('Groq API инициализирован для распознавания речи');
    } else {
      this.logger.warn(
        'GROQ_API_KEY не найден. Распознавание речи будет использовать fallback',
      );
    }
  }

  async recognizeAudio(
    audioBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    try {
      if (!this.groqClient) {
        // Fallback - возвращаем пустую строку, пользователь введет вручную
        this.logger.warn('Groq API недоступен, используем fallback');
        return '';
      }

      // Определяем формат аудио
      const extension = this.getAudioExtension(mimeType);

      // Создаем File-like объект для Groq API
      const audioFile = new File([audioBuffer], `audio.${extension}`, {
        type: mimeType,
      });

      // Отправляем на распознавание через Groq Whisper
      const transcription = await this.groqClient.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3-turbo',
        language: 'fr', // Французский язык
        response_format: 'json',
      });

      this.logger.log(`Распознано: "${transcription.text}"`);
      return transcription.text.trim();
    } catch (error) {
      this.logger.error('Ошибка распознавания речи:', error);
      // В случае ошибки возвращаем пустую строку
      return '';
    }
  }

  private getAudioExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/x-wav': 'wav',
      'audio/wave': 'wav',
      'audio/m4a': 'm4a',
      'audio/mp4': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
    };

    return mimeToExt[mimeType] || 'mp3';
  }
}







