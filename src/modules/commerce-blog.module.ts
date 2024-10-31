import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [UserModule, AuthModule, HealthModule, PostModule],
})
export class CommerceBlogModule {}
