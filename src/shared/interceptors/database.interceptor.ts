import {
  Logger,
  Injectable,
  ConflictException,
  InternalServerErrorException,
  type CallHandler,
  type NestInterceptor,
  type ExecutionContext,
} from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { QueryFailedError, TypeORMError } from 'typeorm';

class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly detail?: string,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

@Injectable()
export class DataBaseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DataBaseInterceptor.name);

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        this.logger.error(
          `Database error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );

        if (error instanceof QueryFailedError) {
          const driverError = error.driverError as any;
          const message = this.getFriendlyMessage(error);

          switch (driverError?.code) {
            case 'ER_DUP_ENTRY': // MySQL/PostgreSQL: Chave duplicada
              throw new ConflictException({
                statusCode: 409,
                message: 'Duplicate entry detected',
                detail: message,
              });
            case '23503': // PostgreSQL: Violação de chave estrangeira
            case 'ER_NO_REFERENCED_ROW': // MySQL: Violação de chave estrangeira
              throw new ConflictException({
                statusCode: 409,
                message: 'Foreign key constraint violation',
                detail: message,
              });
            default:
              throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Database operation failed',
                detail: message,
              });
          }
        }

        if (error instanceof DatabaseError) {
          throw new ConflictException({
            statusCode: 409,
            message: error.message,
            detail: error.detail || 'An unexpected database error occurred',
          });
        }

        if (error instanceof TypeORMError) {
          throw new InternalServerErrorException({
            statusCode: 500,
            message: 'Unexpected database error',
            detail: error.message,
          });
        }

        return throwError(() => error);
      }),
    );
  }

  private getFriendlyMessage(error: QueryFailedError): string {
    const detail = 'detail' in error ? (error.detail as string) : error.message;
    const defaultMessage =
      'A database error occurred while processing your request';

    if (!detail) return defaultMessage;

    if (detail.includes('duplicate key')) {
      return 'The provided value already exists in the database';
    } else if (detail.includes('foreign key')) {
      return 'Referenced record not found or invalid';
    }

    return detail || defaultMessage;
  }
}
