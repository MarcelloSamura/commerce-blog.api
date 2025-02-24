import { Injectable } from '@nestjs/common';

import { PostComment } from '../entities/post-comment.entity';
import type { CreatePostCommentPayload } from '../dtos/create-post-comment.dto';
import type { UpdatePostCommentPayload } from '../dtos/update-post-comment.dto';

@Injectable()
export class PostCommentDomainService {
  public createEntity(
    payload: CreatePostCommentPayload & { commented_by_id: string },
  ) {
    const item = new PostComment();

    Object.assign(item, payload);

    return item;
  }

  public updateEntity(payload: UpdatePostCommentPayload) {
    const item = new PostComment();

    Object.assign(item, payload);

    return item;
  }
}
