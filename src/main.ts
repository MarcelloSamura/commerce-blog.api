import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import { ENV_VARIABLES, IS_DEV_ENV } from './config/env.config';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { DataBaseInterceptor } from './shared/interceptors/database.interceptor';

async function bootstrap() {
  Logger.overrideLogger(
    IS_DEV_ENV
      ? ['debug', 'log', 'warn', 'error', 'verbose']
      : ['warn', 'error'],
  );

  const app = await NestFactory.create(AppModule);

  try {
    app.enableCors({
      origin: corsConfig.allowedDomains,
    });
    app.enableShutdownHooks();
    app.setGlobalPrefix(ENV_VARIABLES.APP_PREFIX);

    /**
     * -----------------------------------------------------------------------------
     * HTTP Interceptor
     * -----------------------------------------------------------------------------
     */
    app.useGlobalInterceptors(
      new DataBaseInterceptor(),
      new LoggingInterceptor(),
    );

    if (IS_DEV_ENV) {
      const [{ SwaggerModule }, { swaggerConfig }, { writeFileSync }] =
        await Promise.all([
          import('@nestjs/swagger'),
          import('./config/swagger.config'),
          import('fs'),
        ]);

      const document = SwaggerModule.createDocument(app, swaggerConfig);

      writeFileSync('swagger-document.json', JSON.stringify(document, null, 2));

      SwaggerModule.setup(ENV_VARIABLES.APP_PREFIX, app, document);
    }

    await app.listen(ENV_VARIABLES.PORT);
  } catch (err) {
    Logger.debug(JSON.stringify({ err }, null, 2));
    process.exit(1);
  }
}
bootstrap();
