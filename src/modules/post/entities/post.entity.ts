import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { PostLike } from 'src/modules/post-like/entities/post-like.entity';
import { PostComment } from 'src/modules/post-comment/entities/post-comment.entity';

import type { CreatePostPayload } from '../dtos/create-post.dto';
import type { UpdatePostPayload } from '../dtos/update-post.dto';

export const postContentMaxLength = 10000;

@Entity('posts')
export class Post extends Base {
  @Index()
  @Column('varchar')
  title: string;

  @Column('varchar', { length: postContentMaxLength })
  content: string;

  @Column('varchar', { nullable: true })
  banner_url: NullableValue<string>;

  @Index()
  @Column('uuid')
  author_id: string;

  @Index()
  @Column('int', { default: 0 })
  likes_count: number;

  @Index()
  @Column('int', { default: 0 })
  comments_count: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  likes: PostLike[];

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  static create(payload: CreatePostPayload & { author_id: string }) {
    const item = new Post();

    Object.assign(item, payload);

    return item;
  }

  static update(payload: UpdatePostPayload) {
    const item = new Post();

    Object.assign(item, payload);

    return item;
  }
}

export const alias = 'post';
export const authorAlias = 'author';
export const commentAlias = 'comments';

export type PostSelectKey =
  | `${typeof alias}.${keyof Post}`
  | `${typeof authorAlias}.${keyof User}`;

export const base_pagination_fields = [
  'post.id',
  'post.banner_url',
  'post.title',
  'post.comments_count',
  'post.likes_count',
  'post.created_at',
  'post.author_id',
] satisfies PostSelectKey[];

export const full_select_fields = [
  'post.id',
  'post.banner_url',
  'post.title',
  'post.comments_count',
  'post.likes_count',
  'post.created_at',
  'post.updated_at',
  'post.content',
  'author.id',
  'author.user_name',
] satisfies PostSelectKey[];
