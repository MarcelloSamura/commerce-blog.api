import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from './entities/post.entity';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { PostLikeModule } from '../post-like/post-like.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), forwardRef(() => PostLikeModule)],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
