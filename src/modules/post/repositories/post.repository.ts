import { IsNull, Not, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  applyQueryFilters,
  applySortingFilter,
} from 'src/utils/apply-query-filters.utils';
import type { User } from 'src/modules/user/entities/user.entity';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { PostLikeService } from 'src/modules/post-like/services/post-like.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

import {
  Post,
  alias,
  authorAlias,
  base_pagination_fields,
  commentAlias,
  full_select_fields,
  get_post_by_id_comments_select_fields,
} from '../entities/post.entity';
import type { PaginatePostsPayload } from '../dtos/paginate-posts.dto';
import { commented_by_alias } from '../../post-comment/entities/post-comment.entity';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(
    @InjectRepository(Post) repository: Repository<Post>,
    private readonly paginationService: PaginationService,
    private readonly postLikeService: PostLikeService,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public createPostQueryBuilder(usePerfomaticSelect = true) {
    const baseQueryBuilder = this.createQueryBuilder(alias);

    if (!usePerfomaticSelect) {
      return baseQueryBuilder
        .leftJoinAndSelect(`${alias}.${authorAlias}`, authorAlias)
        .select(full_select_fields);
    }

    return baseQueryBuilder.select(base_pagination_fields);
  }

  private async addIsLikedByCurrentUserToPosts(
    posts: Post[],
    logged_in_user_id: User['id'],
  ): Promise<(Post & { is_liked_by_current_user: boolean })[]> {
    if (!posts.length) return [];

    const postsIds = new Array(...new Set(posts.map((post) => post.id)));
    const postLikes = await this.postLikeService.getPostLikesByPostIdsAndUserId(
      postsIds,
      logged_in_user_id,
    );

    const likedPostsIdsSet = new Set(
      postLikes.map((postLike) => postLike.post_id),
    );

    return posts.map((post) => ({
      ...post,
      is_liked_by_current_user: likedPostsIdsSet.has(post.id),
    }));
  }

  async paginatePosts(
    { limit, page, sort, ...rest }: PaginatePostsPayload,
    logged_in_user_id?: User['id'],
  ) {
    const queryBuilder = this.createPostQueryBuilder();

    applyQueryFilters(alias, queryBuilder, rest, {
      author_id: '=',
      title: 'LIKE',
    });

    applySortingFilter(alias, queryBuilder, sort);

    const { items, meta } =
      await this.paginationService.paginateWithQueryBuilder(queryBuilder, {
        limit,
        page,
      });

    if (!logged_in_user_id) return { items, meta };

    return {
      items: await this.addIsLikedByCurrentUserToPosts(
        items,
        logged_in_user_id,
      ),
      meta,
    };
  }

  async getUsersPostsImages(
    author_id: User['id'],
  ): Promise<NonNullableObject<Pick<Post, 'banner_url'>>[]> {
    const result = await this.find({
      where: { author_id, banner_url: Not(IsNull()) },
      select: ['banner_url'],
    });

    return result as NonNullableObject<Pick<Post, 'banner_url'>>[];
  }

  async getPostById<T extends boolean = false>(
    id: Post['id'],
    usePerfomaticSelect: T = false as T,
    logged_in_user_id?: User['id'],
  ): Promise<T extends true ? Post & { is_liked_by_current_user?: boolean } : Post> {
    const queryBuilder = this.createPostQueryBuilder(usePerfomaticSelect).where(
      `${alias}.id = :id`,
      { id },
    );

    if (!usePerfomaticSelect) {
      queryBuilder
        .leftJoin(`${alias}.${commentAlias}`, commentAlias)
        .leftJoin(`${commentAlias}.${commented_by_alias}`, commented_by_alias)
        .addSelect(get_post_by_id_comments_select_fields)
        .limit(5);
    }

    const [post, like] = await Promise.all([
      queryBuilder.getOne(),
      logged_in_user_id
        ? this.postLikeService.getPostLikeByPostIdAndUserId(
            id,
            logged_in_user_id,
          )
        : undefined,
    ]);

    if (!post) throw new NotFoundError('Post não encotrado');

    return (like ? { ...post, is_liked_by_current_user: true } : post) as any;
  }
}
