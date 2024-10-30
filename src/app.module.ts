import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { LogModule } from './lib/log/log.module';
import { options } from './lib/database/database.providers';
import { CommerceBlogModule } from './modules/concierge.module';
import { PaginationModule } from './lib/pagination/pagination.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CommerceBlogModule,
    PaginationModule,
    LogModule,
    TypeOrmModule.forRoot(options),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
