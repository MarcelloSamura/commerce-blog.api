import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { HealthModule } from './health/health.module';
import { PostLikeModule } from './post-like/post-like.module';
import { PostCommentModule } from './post-comment/post-comment.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    HealthModule,
    PostModule,
    PostLikeModule,
    PostCommentModule,
  ],
})
export class CommerceBlogModule {}
