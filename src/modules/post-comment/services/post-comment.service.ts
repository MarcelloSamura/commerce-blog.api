import { Repository } from 'typeorm';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from '../../../utils/apply-query-filters.utils';
import { PostService } from 'src/modules/post/services/post.service';
import { PaginationService } from '../../../lib/pagination/pagination.service';
import { NotFoundError } from '../../../lib/http-exceptions/errors/types/not-found-error';

import {
  alias,
  PostComment,
  commented_by_alias,
  base_select_fields,
  postAlias,
  base_pagination_fields_with_post,
} from '../entities/post-comment.entity';
import type { UpdatePostCommentPayload } from '../dtos/update-post-comment.dto';
import type { CreatePostCommentPayload } from '../dtos/create-post-comment.dto';
import type { PaginatePostCommentsPayload } from '../dtos/paginate-post-comments.dto';

@Injectable()
export class PostCommentService {
  constructor(
    private readonly paginationService: PaginationService,
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  private createPostCommentQueryBuilder() {
    return this.postCommentRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.${commented_by_alias}`, commented_by_alias)
      .select(base_select_fields);
  }

  private createPostCommentWithPost() {
    return this.postCommentRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.${postAlias}`, postAlias)
      .select(base_pagination_fields_with_post);
  }

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
    id: string,
    logged_in_user_id: string,
    withPosts = false,
  ) {
    const postComment = withPosts
      ? await this.getPostCommentByIdWithRelatedPost(id)
      : await this.getPostCommentById(id);

    this.checkPermission(postComment, logged_in_user_id);

    return postComment;
  }

  async paginatePostComments({
    limit,
    page,
    sort,
    commented_by_id,
    skip,
    ...rest
  }: PaginatePostCommentsPayload) {
    const queryBuilder = this.createPostCommentQueryBuilder();

    applyQueryFilters(alias, queryBuilder, rest, {
      parent_id: '=',
      post_id: '=',
    });
    applyQueryFilters(
      commented_by_alias,
      queryBuilder,
      { id: commented_by_id },
      { id: '=' },
      true,
    );

    applyOrderByFilters(alias, queryBuilder, sort);

    if (skip) queryBuilder.skip(skip);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      page,
      limit,
    });
  }

  async getPostCommentByIdWithRelatedPost(id: string) {
    const postComment = await this.createPostCommentWithPost()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!postComment) throw new NotFoundError('Comentário inválido');

    return postComment;
  }

  async getPostCommentById(id: string) {
    const postComment = await this.createPostCommentQueryBuilder()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!postComment) throw new NotFoundError('Comentário inválido');

    return postComment;
  }

  async createPostComment(
    { post_id, parent_id, content }: CreatePostCommentPayload,
    logged_in_user_id: string,
  ) {
    const [post, postComment] = await Promise.all([
      this.postService.getPostById(post_id),
      parent_id ? this.getPostCommentById(parent_id) : undefined,
    ]);

    if (postComment && postComment.post_id !== post.id) {
      throw new ForbiddenException('Id do post é inválido');
    }

    const [savedPostComment] = await Promise.all([
      this.postCommentRepository.save(
        PostComment.create({
          content,
          post_id: post.id,
          parent_id: postComment?.id,
          commented_by_id: logged_in_user_id,
        }),
      ),
      this.postService.updateCounts(post, 'comments_count', 'increment'),
    ]);

    return savedPostComment;
  }

  async updatePostComment(
    id: string,
    payload: UpdatePostCommentPayload,
    logged_in_user_id: string,
  ) {
    const postComment = await this.getPostCommentAndCheckPermission(
      id,
      logged_in_user_id,
    );

    return this.postCommentRepository.update(
      postComment.id,
      PostComment.update(payload),
    );
  }

  async deletePostComment(id: string, logged_in_user_id: string) {
    const postComment = await this.getPostCommentAndCheckPermission(
      id,
      logged_in_user_id,
      true,
    );

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
