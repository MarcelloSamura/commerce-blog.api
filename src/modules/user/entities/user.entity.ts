import { Column, Entity, Index, OneToMany } from 'typeorm';

import { Post } from '../../post/entities/post.entity';
import { Base } from '../../../lib/database/entities/base.entity';
import { PostLike } from '../../post-like/entities/post-like.entity';
import { PostComment } from '../../post-comment/entities/post-comment.entity';
import { BadRequestError } from '../../../lib/http-exceptions/errors/types/bad-request-error';

import type { UpdateUserPayload } from '../dtos/update-user.dto';
import type { CreateUserPayload } from '../dtos/create-user.dto';

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

  private static async handleCreateHashedPassword(
    password: string,
  ): Promise<string> {
    return import('../../../utils/password.utils').then(
      ({ createHashedPassword }) => createHashedPassword(password),
    );
  }

  static async create({ password, ...payload }: CreateUserPayload) {
    const userItem = new User();

    const hashed_password = password
      ? await this.handleCreateHashedPassword(password)
      : null;

    Object.assign(userItem, { ...payload, hashed_password });

    return userItem;
  }

  static async update(
    { new_password, previous_password, ...payload }: UpdateUserPayload,
    database_password: string,
  ) {
    const userItem = new User();

    if (new_password) {
      if (!previous_password) {
        throw new BadRequestError(
          'A senha anterior é necessária ao definir uma nova senha.',
        );
      }

      const { validatePassword } = await import(
        '../../../utils/password.utils'
      );

      const isMatch = await validatePassword(
        previous_password,
        database_password,
      );

      if (!isMatch)
        throw new BadRequestError('A senha anterior está incorreta.');

      userItem.hashed_password =
        await this.handleCreateHashedPassword(new_password);
    }

    Object.assign(userItem, payload);

    return userItem;
  }
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
