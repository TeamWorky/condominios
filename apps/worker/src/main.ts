import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { LoggerService } from '@condominios/infrastructure';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  const logger = app.get(LoggerService);
  logger.log('Worker application started', 'WorkerBootstrap');
}

bootstrap();
