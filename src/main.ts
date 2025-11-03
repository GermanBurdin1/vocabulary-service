import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: true, // Разрешить все localhost порты для разработки
		credentials: true,
	});
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
