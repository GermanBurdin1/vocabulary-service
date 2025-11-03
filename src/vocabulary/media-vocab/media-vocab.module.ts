import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaPlatform } from './media-platform.entity';
import { MediaContent } from './media-content.entity';
import { MediaPlatformController } from './media-platform.controller';
import { MediaPlatformService } from './media-platform.service';
import { MediaContentController } from './media-content.controller';
import { MediaContentService } from './media-content.service';

// 📱 ========== MODULE ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ (Flutter) ==========
// Этот модуль используется ТОЛЬКО в Flutter приложении
// НЕ используется в Angular приложении

@Module({
	imports: [TypeOrmModule.forFeature([MediaPlatform, MediaContent])],
	controllers: [MediaPlatformController, MediaContentController],
	providers: [MediaPlatformService, MediaContentService],
	exports: [MediaPlatformService, MediaContentService]
})
export class MediaVocabModule {}

