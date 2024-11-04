import { UseInterceptors } from '@nestjs/common';

import { DataBaseInterceptor } from '../../lib/http-exceptions/errors/interceptors/database.interceptor';

export function DataBaseInterceptorDecorator() {
  return UseInterceptors(DataBaseInterceptor);
}
