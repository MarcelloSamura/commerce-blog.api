import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Post,
  alias as postAlias,
} from 'src/modules/post/entities/post.entity';

import type { CreateLike } from '../dtos/create-like.dto';

@Entity('post-likes')
export class PostLike extends Base {
  @Index()
  @Column('uuid')
  post_id: string;

  @Index()
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  static create(payload: CreateLike) {
    const item = new PostLike();

    Object.assign(item, payload);

    return item;
  }
}

export const alias = 'post-like';

type PostLikeSelectKey = `${typeof alias}.${keyof PostLike}`;

export const base_select_fields = [
  'post-like.id',
  'post-like.post_id',
  'post-like.user_id',
  'post-like.created_at',
] satisfies PostLikeSelectKey[];

type PostLikeSelectKeyWithJoin =
  | PostLikeSelectKey
  | `${typeof postAlias}.${keyof Post}`;

export const base_select_fields_with_join = [
  'post-like.id',
  'post-like.user_id',
  'post.id',
  'post.author_id',
  'post.likes_count',
] satisfies PostLikeSelectKeyWithJoin[];

export { postAlias };
