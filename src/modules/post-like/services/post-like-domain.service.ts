import { Injectable } from '@nestjs/common';

import { PostLike } from '../entities/post-like.entity';
import type { CreateLike } from '../dtos/create-like.dto';

@Injectable()
export class PostLikeDomainService {
  public createPostLikeEntity(payload: CreateLike) {
    const item = new PostLike();

    Object.assign(item, payload);

    return item;
  }
}
