import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

import { PostModule } from '../post/post.module';
import { PostLike } from './entities/post-like.entity';
import { PostLikeService } from './services/post-like.service';
import { PostLikeController } from './controllers/post-like.controller';
import { PostLikeRepository } from './repositories/post-like.repository';
import { PostLikeDomainService } from './services/post-like-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike]), forwardRef(() => PostModule)],
  controllers: [PostLikeController],
  providers: [PostLikeService, PostLikeDomainService, PostLikeRepository],
  exports: [PostLikeService, PostLikeDomainService, PostLikeRepository],
})
export class PostLikeModule {}
