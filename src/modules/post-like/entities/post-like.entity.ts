import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Base } from '../../../lib/database/entities/base.entity';
import { Post, alias as postAlias } from '../../post/entities/post.entity';

import type { CreateLike } from '../dtos/create-like.dto';

@Entity('post-likes')
export class PostLike extends Base {
  @Index()
  @Column('uuid')
  post_id: Post['id'];

  @Index()
  @Column('uuid')
  user_id: User['id'];

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}

export const alias = 'post-like';

type PostLikeSelectKey = `${typeof alias}.${keyof PostLike}`;

export const base_select_fields = [
  'post-like.id',
  'post-like.post_id',
  'post-like.user_id',
  'post-like.created_at',
] satisfies PostLikeSelectKey[];

export type PostLikeSelectKeyWithJoin =
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
