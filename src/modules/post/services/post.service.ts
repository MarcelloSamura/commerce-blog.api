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
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { PostLikeService } from 'src/modules/post-like/services/post-like.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { commented_by_alias } from 'src/modules/post-comment/entities/post-comment.entity';

import {
  Post,
  alias,
  authorAlias,
  full_select_fields,
  base_pagination_fields,
  commentAlias,
  get_post_by_id_comments_select_fields,
} from '../entities/post.entity';
import type { UpdatePostPayload } from '../dtos/update-post.dto';
import type { CreatePostPayload } from '../dtos/create-post.dto';
import type { PaginatePostsPayload } from '../dtos/paginate-posts.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => PostLikeService))
    private readonly postLikeService: PostLikeService,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  private createPostQueryBuilder(usePerfomaticSelect = true) {
    const baseQueryBuilder = this.postRepository.createQueryBuilder(alias);

    if (!usePerfomaticSelect) {
      return baseQueryBuilder
        .leftJoinAndSelect(`${alias}.${authorAlias}`, authorAlias)
        .select(full_select_fields);
    }

    return baseQueryBuilder.select(base_pagination_fields);
  }

  private checkPermission(post: Post, logged_in_user_id: string) {
    const postAuthorId = post?.author_id || post.author.id;

    if (postAuthorId !== logged_in_user_id) {
      throw new ForbiddenException('Não pode alterar um post que não é seu');
    }
  }

  async paginatePosts(
    { limit, page, sort, ...rest }: PaginatePostsPayload,
    logged_in_user_id?: string,
  ) {
    const queryBuilder = this.createPostQueryBuilder();

    applyQueryFilters(alias, queryBuilder, rest, {
      author_id: '=',
      title: 'LIKE',
    });

    applyOrderByFilters(alias, queryBuilder, sort);

    const { items, meta } =
      await this.paginationService.paginateWithQueryBuilder(queryBuilder, {
        limit,
        page,
      });

    if (!logged_in_user_id) return { items, meta };

    return {
      items: await this.addIsLikedByCurrentUserToPost(items, logged_in_user_id),
      meta,
    };
  }

  async getPostById(
    id: string,
    usePerfomaticSelect = false,
    logged_in_user_id?: string,
  ): Promise<Post & { is_liked_by_current_user?: boolean }> {
    const queryBuilder = this.createPostQueryBuilder(usePerfomaticSelect).where(
      `${alias}.id = :id`,
      { id },
    );

    if (!usePerfomaticSelect) {
      queryBuilder
        .leftJoinAndSelect(`${alias}.${commentAlias}`, commentAlias)
        .leftJoinAndSelect(
          `${commentAlias}.${commented_by_alias}`,
          commented_by_alias,
        )
        .limit(5)
        .addSelect(get_post_by_id_comments_select_fields);
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

    return like ? { ...post, is_liked_by_current_user: true } : post;
  }

  private async addIsLikedByCurrentUserToPost(
    posts: Post[],
    logged_in_user_id: string,
  ): Promise<(Post & { is_liked_by_current_user: boolean })[]> {
    if (!posts.length) return [];

    const postsIds = new Array(...new Set(posts.map((post) => post.id)));
    const postLikes = await this.postLikeService.getPostLikesByPostIdsAndUserId(
      postsIds,
      logged_in_user_id,
    );

    const postLikesIdsSet = new Set(
      postLikes.map((postLike) => postLike.post_id),
    );

    return posts.map((post) => ({
      ...post,
      is_liked_by_current_user: postLikesIdsSet.has(post.id),
    }));
  }

  async createPost(
    payload: CreatePostPayload,
    author_id: string,
  ): Promise<Post> {
    const postToCreate = Post.create({ ...payload, author_id });

    return this.postRepository.save(postToCreate);
  }

  async updateCounts(
    post: Post,
    key: 'likes_count' | 'comments_count',
    type: CountHandler,
  ) {
    if (post[key] === 0 && type === 'decrement') return;

    post[key] += type === 'increment' ? 1 : -1;

    return this.postRepository.update(post.id, {
      [key]: post[key],
    });
  }

  async updatePost(id: string, payload: UpdatePostPayload, author_id: string) {
    const postToUpdate = await this.getPostById(id, true);

    this.checkPermission(postToUpdate, author_id);

    const updatedPost = Post.update(payload);

    return this.postRepository.update(postToUpdate.id, updatedPost);
  }

  async deletePost(id: string, author_id: string) {
    const postToDelete = await this.getPostById(id, true);

    this.checkPermission(postToDelete, author_id);

    return this.postRepository.remove(postToDelete);
  }
}
