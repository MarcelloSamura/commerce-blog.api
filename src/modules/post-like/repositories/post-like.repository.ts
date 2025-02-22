import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  applyQueryFilters,
  applySortingFilter,
} from 'src/utils/apply-query-filters.utils';
import type { Post } from 'src/modules/post/entities/post.entity';
import type { User } from 'src/modules/user/entities/user.entity';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

import {
  PostLike,
  alias,
  postAlias,
  base_select_fields,
  base_select_fields_with_join,
  type PostLikeSelectKeyWithJoin,
} from '../entities/post-like.entity';
import type { PaginatePostLikesPayload } from '../dtos/paginate-post-likes.dto';

@Injectable()
export class PostLikeRepository extends Repository<PostLike> {
  constructor(
    @InjectRepository(PostLike) repository: Repository<PostLike>,
    private readonly paginationService: PaginationService,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public createPostLikesQueryBuilder(withJoin = false) {
    const baseQueryBuilder = this.createQueryBuilder(alias);

    if (withJoin) {
      return baseQueryBuilder
        .leftJoinAndSelect(`${alias}.${postAlias}`, postAlias)
        .select(base_select_fields_with_join);
    }

    return baseQueryBuilder.select(base_select_fields);
  }

  public async paginatePostLikes({
    limit,
    page,
    sort,
    ...rest
  }: PaginatePostLikesPayload): Promise<PaginatedResult<PostLike>> {
    const queryBuilder = this.createPostLikesQueryBuilder();

    applyQueryFilters(alias, queryBuilder, rest, {
      post_id: '=',
      user_id: '=',
    });

    applySortingFilter(alias, queryBuilder, sort);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  async getPostLikesByPostIdsAndUserId(
    post_ids: Post['id'][],
    logged_in_user_id: User['id'],
  ): Promise<PostLike[]> {
    const postLikes = await this.createPostLikesQueryBuilder()
      .where(`${alias}.post_id IN (:...post_ids)`, { post_ids })
      .andWhere(`${alias}.user_id = :logged_in_user_id`, { logged_in_user_id })
      .take(post_ids.length)
      .getMany();

    return postLikes;
  }

  public async getPostLikeByPostIdAndUserId(
    post_id: Post['id'],
    user_id: User['id'],
    withJoin = false,
  ): Promise<NullableValue<PostLike>> {
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

  public async getUsersPostLikes(user_id: User['id']) {
    const result = await this.createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.${postAlias}`, `${postAlias}`)
      .where(`${alias}.user_id = :user_id`, { user_id })
      .select([
        `${postAlias}.id`,
        `${postAlias}.likes_count`,
      ] as PostLikeSelectKeyWithJoin[])
      .getMany();

    return result as { post: { likes_count: number; id: PostLike['id'] } }[];
  }

  public async getPostLikeById(id: PostLike['id']): Promise<PostLike> {
    const postLike = await this.createPostLikesQueryBuilder()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!postLike) throw new NotFoundError('Post like not found');

    return postLike;
  }

  public async savePostLike(postLike: PostLike): Promise<PostLike> {
    return this.save(postLike);
  }
}
