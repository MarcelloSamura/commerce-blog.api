import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostModule } from '../post/post.module';
import { PostComment } from './entities/post-comment.entity';
import { PostCommentService } from './services/post-comment.service';
import { PostCommentController } from './controllers/post-comment.controller';
import { PostCommentRepository } from './repositories/post-comment.repository';
import { PostCommentDomainService } from './services/post-comment-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment]), PostModule],
  providers: [
    PostCommentService,
    PostCommentRepository,
    PostCommentDomainService,
  ],
  exports: [
    PostCommentService,
    PostCommentRepository,
    PostCommentDomainService,
  ],
  controllers: [PostCommentController],
})
export class PostCommentModule {}
