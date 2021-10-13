import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { X_API_KEY, X_DATABASE_ID } from './packages/constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  /**
   * Config
   */
  app.useStaticAssets(join(__dirname, '../', 'public'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });
  app.enableCors();

  /**
   * Swagger
   */
  const serverUrl = configService.get('APP_URL');
  const appName = configService.get('APP_NAME');
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(appName)
      .setDescription(`The ${appName} API documentation CI`)
      .setVersion('1.0')
      .addServer(serverUrl, 'REST APIs')
      .addBearerAuth()
      .addSecurity(X_API_KEY.toLowerCase(), {
        name: X_API_KEY,
        in: 'header',
        type: 'apiKey',
      })
      .addSecurity(X_DATABASE_ID.toLowerCase(), {
        name: X_DATABASE_ID,
        in: 'header',
        type: 'apiKey',
      })
      .build(),
  );
  SwaggerModule.setup('api/documentation', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: `${appName} - Swagger Documentation`,
  });

  const port = +configService.get<number>('PORT', 3000);
  await app.listen(port, () => console.log(`Listening on port ${port}`));
}
bootstrap();
