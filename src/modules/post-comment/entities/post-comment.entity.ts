import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import {
  Post,
  alias as postAlias,
} from 'src/modules/post/entities/post.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Base } from 'src/lib/database/entities/base.entity';

import type { CreatePostCommentPayload } from '../dtos/create-post-comment.dto';
import type { UpdatePostCommentPayload } from '../dtos/update-post-comment.dto';

export const postCommentContentMaxLength = 2500;

@Entity('post-comments')
export class PostComment extends Base {
  @Index()
  @Column('uuid')
  commented_by_id: string;

  @Column('varchar', { length: postCommentContentMaxLength })
  content: string;

  @Index()
  @Column('uuid')
  post_id: string;

  @Index()
  @Column('uuid', { nullable: true, default: null })
  parent_id: NullableValue<string>;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'commented_by_id' })
  commented_by: User;

  @ManyToOne(() => Post, (post) => post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => PostComment, (comment) => comment.replies, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: NullableValue<PostComment>;

  @OneToMany(() => PostComment, (comment) => comment.parent)
  replies: PostComment[];

  static create(
    payload: CreatePostCommentPayload & { commented_by_id: string },
  ) {
    const item = new PostComment();

    Object.assign(item, payload);

    return item;
  }

  static update(payload: UpdatePostCommentPayload) {
    const item = new PostComment();

    Object.assign(item, payload);

    return item;
  }
}

export const alias = 'post-comment';
export const commented_by_alias = 'commented_by';

export type PostCommentSelectKey =
  | `${typeof alias}.${keyof PostComment}`
  | `${typeof commented_by_alias}.${keyof User}`;

export const base_select_fields = [
  'post-comment.id',
  'post-comment.content',
  'post-comment.created_at',
  'post-comment.updated_at',
  'post-comment.parent_id',
  'post-comment.post_id',
  'commented_by.id',
  'commented_by.user_photo_url',
  'commented_by.user_name',
] satisfies PostCommentSelectKey[];

type PostCommentSelectKeyWithPost =
  | PostCommentSelectKey
  | `${typeof postAlias}.${keyof Post}`;

export const base_pagination_fields_with_post = [
  'post-comment.id',
  'post.id',
  'post.comments_count',
  'post-comment.commented_by_id',
  'post-comment.created_at',
] satisfies PostCommentSelectKeyWithPost[];

export { postAlias };
