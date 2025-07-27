import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: 'http://localhost:4200', 
	});
  await app.listen(process.env.PORT ?? 3000);
  console.log('[VocabularyService] Service démarré sur le port:', process.env.PORT ?? 3000);
  // TODO : ajouter un health check endpoint et validation CORS pour production
}
bootstrap();
