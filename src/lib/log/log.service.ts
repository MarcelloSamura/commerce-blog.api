import { Injectable, Logger } from '@nestjs/common';

import { IS_DEV_ENV } from 'src/config/env.config';

@Injectable()
export class LogService {
  public readonly logger: Logger | undefined = IS_DEV_ENV
    ? new Logger(LogService.name)
    : undefined;
}
