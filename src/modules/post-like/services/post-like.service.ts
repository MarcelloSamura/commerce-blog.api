import {
  Inject,
  Injectable,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { PostService } from 'src/modules/post/services/post.service';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

import {
  alias,
  PostLike,
  postAlias,
  base_select_fields,
  base_select_fields_with_join,
} from '../entities/post-like.entity';
import type { PaginatePostLikesPayload } from '../dtos/paginate-post-likes.dto';

@Injectable()
export class PostLikeService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  private createPostLikesQueryBuilder(withJoin = false) {
    const baseQueryBuilder = this.postLikeRepository.createQueryBuilder(alias);

    if (withJoin) {
      return baseQueryBuilder
        .leftJoinAndSelect(`${alias}.${postAlias}`, postAlias)
        .select(base_select_fields_with_join);
    }

    return baseQueryBuilder.select(base_select_fields);
  }

  async paginatePostLikes({
    limit,
    page,
    sort,
    ...rest
  }: PaginatePostLikesPayload) {
    const queryBuilder = this.createPostLikesQueryBuilder();

    applyQueryFilters(alias, queryBuilder, rest, {
      post_id: '=',
      user_id: '=',
    });

    applyOrderByFilters(alias, queryBuilder, sort);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  async getPostLikesByPostIdsAndUserId(
    post_ids: string[],
    logged_in_user_id: string,
  ) {
    const postLikes = await this.createPostLikesQueryBuilder()
      .where(`${alias}.post_id IN (:...post_ids)`, { post_ids })
      .andWhere(`${alias}.user_id = :logged_in_user_id`, { logged_in_user_id })
      .take(post_ids.length)
      .getMany();

    return postLikes;
  }

  async getPostLikeByPostIdAndUserId(
    post_id: string,
    user_id: string,
    withJoin = false,
  ) {
    const queryBuilder = this.createPostLikesQueryBuilder(withJoin);

    applyQueryFilters(
      alias,
      queryBuilder,
      { post_id, user_id },
      {
        post_id: '=',
        user_id: '=',
      },
    );

    return queryBuilder.getOne();
  }

  async getPostLikeById(id: string): Promise<PostLike> {
    const postLike = await this.createPostLikesQueryBuilder()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!postLike) throw new NotFoundError('Post like not found');

    return postLike;
  }

  async likePost(post_id: string, logged_in_user_id: string) {
    const wasPostLiked = await this.getPostLikeByPostIdAndUserId(
      post_id,
      logged_in_user_id,
    );

    if (wasPostLiked) throw new ForbiddenException('Já gostou do post');

    const post = await this.postService.getPostById(post_id, true);

    if (post.author_id === logged_in_user_id) {
      throw new ForbiddenException('Não pode gostar do próprio post');
    }

    const [savedPostLike] = await Promise.all([
      this.postLikeRepository.save(
        PostLike.create({ post_id: post.id, user_id: logged_in_user_id }),
      ),
      this.postService.updateCounts(post, 'likes_count', 'increment'),
    ]);

    return savedPostLike;
  }

  private async deleteLike(postLike: PostLike, user_id: string) {
    if (postLike.user_id !== user_id) throw new ForbiddenException('Proíbido');

    return this.postLikeRepository.remove(postLike);
  }

  async removeLike(post_id: string, logged_in_user_id: string) {
    const wasPostLiked = await this.getPostLikeByPostIdAndUserId(
      post_id,
      logged_in_user_id,
      true,
    );

    if (!wasPostLiked)
      throw new ForbiddenException('Post ainda não foi gostado');

    const [deleteResult] = await Promise.all([
      this.deleteLike(wasPostLiked, logged_in_user_id),
      this.postService.updateCounts(
        wasPostLiked.post,
        'likes_count',
        'decrement',
      ),
    ]);

    return deleteResult;
  }
}
