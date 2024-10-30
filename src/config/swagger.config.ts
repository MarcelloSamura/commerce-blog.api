import { DocumentBuilder } from '@nestjs/swagger';

import { version, name } from '../../package.json';

export const swaggerConfig = new DocumentBuilder()
  .setTitle(name)
  .setVersion(version)
  .addTag('auth')
  .addTag('user')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .build();
