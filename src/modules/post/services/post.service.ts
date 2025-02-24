import { del } from '@vercel/blob';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';

import type { User } from 'src/modules/user/entities/user.entity';

import { PostLikeService } from '../../post-like/services/post-like.service';

import type { Post } from '../entities/post.entity';
import { PostDomainService } from './post-domain.service';
import { PostRepository } from '../repositories/post.repository';
import type { UpdatePostPayload } from '../dtos/update-post.dto';
import type { CreatePostPayload } from '../dtos/create-post.dto';
import type { PaginatePostsPayload } from '../dtos/paginate-posts.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postDomainService: PostDomainService,
    @Inject(forwardRef(() => PostLikeService))
    private readonly postLikeService: PostLikeService,
    private readonly postRepository: PostRepository,
  ) {}

  private checkPermission(post: Post, logged_in_user_id: string) {
    const postAuthorId = post?.author_id || post.author.id;

    if (postAuthorId !== logged_in_user_id) {
      throw new ForbiddenException('Não pode alterar um post que não é seu');
    }
  }

  async paginatePosts(
    data: PaginatePostsPayload,
    logged_in_user_id?: User['id'],
  ) {
    return this.postRepository.paginatePosts(data, logged_in_user_id);
  }

  async getUsersPostsImages(
    author_id: User['id'],
  ): Promise<NonNullableObject<Pick<Post, 'banner_url'>>[]> {
    return this.postRepository.getUsersPostsImages(author_id);
  }

  async getPostById(
    id: Post['id'],
    usePerfomaticSelect = false,
    logged_in_user_id?: User['id'],
  ) {
    return this.postRepository.getPostById(
      id,
      usePerfomaticSelect,
      logged_in_user_id,
    );
  }

  async createPost(
    payload: CreatePostPayload,
    author_id: string,
  ): Promise<Post> {
    const postToCreate = this.postDomainService.createPostEntity({
      ...payload,
      author_id,
    });

    return this.postRepository.save(postToCreate);
  }

  async updateCounts(
    post: Post,
    key: keyof Pick<Post, 'comments_count' | 'likes_count'>,
    type: CountHandler,
  ) {
    if (post[key] === 0 && type === 'decrement') return;

    post[key] += type === 'increment' ? 1 : -1;

    return this.postRepository.update(post.id, {
      [key]: post[key],
    });
  }

  async handleDeleteUserLikes(user_id: User['id']) {
    const likes = await this.postLikeService.getUsersPostLikes(user_id);

    if (!likes.length) return;

    await Promise.all(
      likes.map((like) =>
        this.updateCounts(like.post as Post, 'likes_count', 'decrement'),
      ),
    );
  }

  private async getPostAndCheckPermission(
    id: Post['id'],
    author_id: User['id'],
    usePerfomaticSelect = true,
  ): Promise<Post> {
    const post = await this.getPostById(id, usePerfomaticSelect);

    this.checkPermission(post, author_id);

    return post;
  }

  async updatePost(
    id: Post['id'],
    payload: UpdatePostPayload,
    author_id: User['id'],
  ) {
    const postToUpdate = await this.getPostAndCheckPermission(id, author_id);

    if (payload.banner_url && postToUpdate.banner_url) {
      await del(postToUpdate.banner_url);
    }

    const updatedPost = this.postDomainService.updatePostEntity(payload);

    return this.postRepository.update(postToUpdate.id, updatedPost);
  }

  async deletePost(id: Post['id'], author_id: User['id']) {
    const postToDelete = await this.getPostAndCheckPermission(id, author_id);

    if (postToDelete.banner_url) await del(postToDelete.banner_url);

    return this.postRepository.remove(postToDelete);
  }
}
