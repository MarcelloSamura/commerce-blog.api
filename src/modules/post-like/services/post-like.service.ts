import {
  Inject,
  Injectable,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';

import type { Post } from 'src/modules/post/entities/post.entity';
import type { User } from 'src/modules/user/entities/user.entity';

import { PostService } from '../../post/services/post.service';

import { PostLike } from '../entities/post-like.entity';
import { PostLikeDomainService } from './post-like-domain.service';
import { PostLikeRepository } from '../repositories/post-like.repository';
import type { PaginatePostLikesPayload } from '../dtos/paginate-post-likes.dto';

@Injectable()
export class PostLikeService {
  constructor(
    private readonly postLikeRepository: PostLikeRepository,
    private readonly postLikeDomainService: PostLikeDomainService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async paginatePostLikes(data: PaginatePostLikesPayload) {
    return this.postLikeRepository.paginatePostLikes(data);
  }

  async getPostLikesByPostIdsAndUserId(
    post_ids: Post['id'][],
    logged_in_user_id: User['id'],
  ) {
    return this.postLikeRepository.getPostLikesByPostIdsAndUserId(
      post_ids,
      logged_in_user_id,
    );
  }

  async getPostLikeByPostIdAndUserId(
    post_id: Post['id'],
    user_id: User['id'],
    withJoin = false,
  ) {
    return this.postLikeRepository.getPostLikeByPostIdAndUserId(
      post_id,
      user_id,
      withJoin,
    );
  }

  async getUsersPostLikes(user_id: User['id']) {
    return this.postLikeRepository.getUsersPostLikes(user_id);
  }

  async getPostLikeById(id: PostLike['id']) {
    return this.postLikeRepository.getPostLikeById(id);
  }

  async likePost(post_id: Post['id'], logged_in_user_id: User['id']) {
    const wasPostLiked = await this.getPostLikeByPostIdAndUserId(
      post_id,
      logged_in_user_id,
    );

    if (wasPostLiked) throw new ForbiddenException('Já gostou do post');

    const post = await this.postService.getPostById(post_id, true);

    if (post.author_id === logged_in_user_id) {
      throw new ForbiddenException('Não pode gostar do próprio post');
    }

    const postLikeToCreate = this.postLikeDomainService.createPostLikeEntity({
      post_id: post.id,
      user_id: logged_in_user_id,
    });

    const [savedPostLike] = await Promise.all([
      this.postLikeRepository.savePostLike(postLikeToCreate),
      this.postService.updateCounts(post, 'likes_count', 'increment'),
    ]);

    return savedPostLike;
  }

  private async deleteLike(postLike: PostLike, user_id: User['id']) {
    if (postLike.user_id !== user_id) throw new ForbiddenException('Proíbido');

    return this.postLikeRepository.remove(postLike);
  }

  async removeLike(post_id: Post['id'], logged_in_user_id: User['id']) {
    const likedPost = await this.getPostLikeByPostIdAndUserId(
      post_id,
      logged_in_user_id,
      true,
    );

    if (!likedPost) throw new ForbiddenException('Post ainda não foi gostado');

    const [deleteResult] = await Promise.all([
      this.deleteLike(likedPost, logged_in_user_id),
      this.postService.updateCounts(likedPost.post, 'likes_count', 'decrement'),
    ]);

    return deleteResult;
  }
}
