import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as cors from 'cors';
import * as compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cors());
  app.use(helmet());
  app.use(compression());

  app.setGlobalPrefix('api');

  const port = Number(app.get(ConfigService).get<number>('PORT') ?? 3001);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
