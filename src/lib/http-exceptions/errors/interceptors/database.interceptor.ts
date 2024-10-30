import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { QueryFailedError } from 'typeorm';

import { DataBaseError } from '../types/data-base-error';

@Injectable()
export class DataBaseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof QueryFailedError) {
          throw new ConflictException({
            detail: 'detail' in error ? error.detail : error.message,
          });
        } else if (error instanceof DataBaseError) {
          throw new ConflictException({
            detail: 'detail' in error ? error.detail : error.message,
          });
        }
        throw error;
      }),
    );
  }
}
