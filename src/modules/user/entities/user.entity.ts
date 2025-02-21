import { Column, Entity, Index, OneToMany } from 'typeorm';

import { Post } from '../../post/entities/post.entity';
import { Base } from '../../../lib/database/entities/base.entity';
import { PostLike } from '../../post-like/entities/post-like.entity';
import { PostComment } from '../../post-comment/entities/post-comment.entity';

@Entity('users')
export class User extends Base {
  @Index()
  @Column('varchar')
  user_name: string;

  @Column('varchar')
  hashed_password: string;

  @Index()
  @Column('varchar', { unique: true })
  user_email: string;

  @Index()
  @Column('varchar', { nullable: true })
  phone_number: NullableValue<string>;

  @Column('varchar', { nullable: true, unique: true })
  user_photo_url: NullableValue<string>;

  @Column('date', { nullable: true })
  date_of_birth: NullableValue<string>;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => PostLike, (post) => post.user)
  liked_posts: PostLike[];

  @OneToMany(() => PostComment, (postC) => postC.commented_by)
  comments: PostComment[];
}

export const alias = 'user';

export type UserSelectKey = `${typeof alias}.${keyof User}`;

export const base_fields = [
  'user.id',
  'user.created_at',
  'user.updated_at',
  'user.user_name',
  'user.user_email',
  'user.phone_number',
  'user.date_of_birth',
  'user.user_photo_url',
] satisfies UserSelectKey[];
