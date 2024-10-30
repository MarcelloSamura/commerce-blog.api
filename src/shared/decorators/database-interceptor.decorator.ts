import { UseInterceptors } from '@nestjs/common';

import { DataBaseInterceptor } from 'src/lib/http-exceptions/errors/interceptors/database.interceptor';

export function DataBaseInterceptorDecorator() {
  return UseInterceptors(DataBaseInterceptor);
}
