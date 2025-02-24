import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';

import { PostService } from 'src/modules/post/services/post.service';
import type { User } from 'src/modules/user/entities/user.entity';

import type { PostComment } from '../entities/post-comment.entity';
import { PostCommentDomainService } from './post-comment-domain.service';
import { PostCommentRepository } from '../repositories/post-comment.repository';
import type { UpdatePostCommentPayload } from '../dtos/update-post-comment.dto';
import type { CreatePostCommentPayload } from '../dtos/create-post-comment.dto';
import type { PaginatePostCommentsPayload } from '../dtos/paginate-post-comments.dto';

@Injectable()
export class PostCommentService {
  constructor(
    private readonly postCommentDomainService: PostCommentDomainService,
    private readonly postCommentRepository: PostCommentRepository,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  private checkPermission(postComment: PostComment, logged_in_user_id: string) {
    const commentedById =
      postComment.commented_by_id || postComment.commented_by.id;

    if (commentedById !== logged_in_user_id) {
      throw new ForbiddenException(
        'Não pode alterar um comentário que não é seu',
      );
    }
  }

  private async getPostCommentAndCheckPermission(
    id: PostComment['id'],
    logged_in_user_id: User['id'],
    withPosts = false,
  ) {
    const postComment = withPosts
      ? await this.postCommentRepository.getPostCommentByIdWithRelatedPost(id)
      : await this.postCommentRepository.getPostCommentById(id);

    this.checkPermission(postComment, logged_in_user_id);

    return postComment;
  }

  async paginatePostComments(data: PaginatePostCommentsPayload) {
    return this.postCommentRepository.paginatePostComments(data);
  }

  async getPostCommentById(id: PostComment['id']) {
    return this.postCommentRepository.getPostCommentById(id);
  }

  async createPostComment(
    { post_id, parent_id, content }: CreatePostCommentPayload,
    logged_in_user_id: User['id'],
  ) {
    const [post, parentComment] = await Promise.all([
      this.postService.getPostById(post_id),
      parent_id
        ? this.postCommentRepository.getPostCommentById(parent_id)
        : undefined,
    ]);

    if (parentComment && parentComment.post_id !== post.id) {
      throw new ForbiddenException('Id do post é inválido');
    }

    const [savedPostComment] = await Promise.all([
      this.postCommentRepository.save(
        this.postCommentDomainService.createEntity({
          content,
          post_id: post.id,
          parent_id: parentComment?.id,
          commented_by_id: logged_in_user_id,
        }),
      ),
      this.postService.updateCounts(post, 'comments_count', 'increment'),
      parentComment
        ? this.updatePostCommentRepliesCount(parentComment, 'increment')
        : undefined,
    ]);

    return savedPostComment;
  }

  async updatePostCommentRepliesCount(
    postComment: PostComment,
    type: CountHandler,
  ) {
    if (postComment.replies_count === 0 && type === 'decrement') return;

    postComment.replies_count += type === 'increment' ? 1 : -1;

    return this.postCommentRepository.update(postComment.id, {
      replies_count: postComment.replies_count,
    });
  }

  async updatePostComment(
    id: PostComment['id'],
    payload: UpdatePostCommentPayload,
    logged_in_user_id: User['id'],
  ) {
    const postComment = await this.getPostCommentAndCheckPermission(
      id,
      logged_in_user_id,
    );

    return this.postCommentRepository.update(
      postComment.id,
      this.postCommentDomainService.updateEntity(payload),
    );
  }

  async deletePostComment(
    id: PostComment['id'],
    logged_in_user_id: User['id'],
  ) {
    const postComment = await this.getPostCommentAndCheckPermission(
      id,
      logged_in_user_id,
      true,
    );

    if (postComment.parent_id) {
      const parentComment = await this.postCommentRepository.getPostCommentById(
        postComment.parent_id,
      );

      await this.updatePostCommentRepliesCount(parentComment, 'decrement');
    }

    const [removeResult] = await Promise.all([
      this.postCommentRepository.remove(postComment),
      this.postService.updateCounts(
        postComment.post,
        'comments_count',
        'decrement',
      ),
    ]);

    return removeResult;
  }
}
