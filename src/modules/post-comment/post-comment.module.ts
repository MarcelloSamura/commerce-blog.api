import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostModule } from '../post/post.module';
import { PostComment } from './entities/post-comment.entity';
import { PostCommentService } from './services/post-comment.service';
import { PostCommentController } from './controllers/post-comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment]), PostModule],
  providers: [PostCommentService],
  exports: [PostCommentService],
  controllers: [PostCommentController],
})
export class PostCommentModule {}
