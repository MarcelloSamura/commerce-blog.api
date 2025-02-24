import {
  Logger,
  Injectable,
  type ExecutionContext,
  type CallHandler,
  type NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import type { Response, Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    this.logger.log(`Incoming Request - Method: ${method} | URL: ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const executionTime = Date.now() - now;
          const statusCode = response.status;

          this.logger.log(
            `Request Completed - Method: ${method} | URL: ${url} | Status: ${statusCode} | Time: ${executionTime}ms`,
          );
        },
        error: (error) => {
          const executionTime = Date.now() - now;
          const statusCode = error.status || 500;

          this.logger.error(
            `Request Failed - Method: ${method} | URL: ${url} | Status: ${statusCode} | Time: ${executionTime}ms | Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
