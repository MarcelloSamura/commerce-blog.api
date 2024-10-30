import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConectionDataSorceError } from '../types/conection-dataSource-error';

@Injectable()
export class DataSourceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof ConectionDataSorceError) {
          throw new ConectionDataSorceError(error.message, 500);
        } else {
          throw error;
        }
      }),
    );
  }
}
