import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CondominiumModule } from './condominium/condominium.module';
import { CondominiumChatModule } from './condominium-chat/condominium-chat.module';
import { CondominiumMemberModule } from './condominium-member/condominium-member.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    CondominiumModule,
    CondominiumMemberModule,
    ScheduleModule,
    HealthModule,
    CondominiumChatModule,
  ],
})
export class ConciergeModule {}
