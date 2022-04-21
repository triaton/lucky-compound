import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('LuckyChip API')
    .setDescription('The luckychip API description')
    .setVersion('1.0')
    .addTag('beans')
    .build();
  app.enableCors({
    origin: '*',
  });
  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/docs',
    expressBasicAuth({
      challenge: true,
      users: {
        beans: 'secret',
      },
    }),
  );
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
