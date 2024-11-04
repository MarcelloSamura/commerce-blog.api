import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import { ENV_VARIABLES, IS_DEV_ENV } from './config/env.config';
import { DataBaseInterceptor } from './lib/http-exceptions/errors/interceptors/database.interceptor';
import { NotFoundInterceptor } from './lib/http-exceptions/errors/interceptors/not-found.interceptor';
import { BadRequestInterceptor } from './lib/http-exceptions/errors/interceptors/bad-request.interceptor';
import { UnauthorizedInterceptor } from './lib/http-exceptions/errors/interceptors/unauthorized.interceptor';
import { DataSourceInterceptor } from './lib/http-exceptions/errors/interceptors/conction-data-source.interceptor';

async function bootstrap() {
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
      new UnauthorizedInterceptor(),
      new DataSourceInterceptor(),
      new BadRequestInterceptor(),
      new NotFoundInterceptor(),
      new DataBaseInterceptor(),
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
