import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from './entities/post.entity';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { PostLikeModule } from '../post-like/post-like.module';
import { PostRepository } from './repositories/post.repository';
import { PostDomainService } from './services/post-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), forwardRef(() => PostLikeModule)],
  controllers: [PostController],
  providers: [PostService, PostDomainService, PostRepository],
  exports: [PostService, PostDomainService, PostRepository],
})
export class PostModule {}
