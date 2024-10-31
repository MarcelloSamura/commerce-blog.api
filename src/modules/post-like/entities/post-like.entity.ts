import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Post } from 'src/modules/post/entities/post.entity';

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
}
