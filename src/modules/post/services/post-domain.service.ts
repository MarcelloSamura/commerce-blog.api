import { Injectable } from '@nestjs/common';

import { Post } from '../entities/post.entity';
import type { CreatePostPayload } from '../dtos/create-post.dto';
import type { UpdatePostPayload } from '../dtos/update-post.dto';

@Injectable()
export class PostDomainService {
  public createPostEntity(payload: CreatePostPayload & { author_id: string }) {
    const item = new Post();

    Object.assign(item, payload);

    return item;
  }

  public updatePostEntity(payload: UpdatePostPayload) {
    const item = new Post();

    Object.assign(item, payload);

    return item;
  }
}
