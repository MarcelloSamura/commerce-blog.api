import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  uuidSchema,
  stringSchema,
  optionalUuidSchema,
} from 'src/shared/schemas.shared';

import { postCommentContentMaxLength } from '../entities/post-comment.entity';

export const createdPostCommentSchema = z.object({
  post_id: uuidSchema,
  parent_id: optionalUuidSchema,
  content: stringSchema.max(postCommentContentMaxLength),
});

export type CreatePostCommentPayload = z.infer<typeof createdPostCommentSchema>;

export class CreatePostCommentDTO extends createZodDto(
  createdPostCommentSchema,
) {
  @ApiProperty()
  post_id: string;

  @ApiPropertyOptional()
  parent_id?: string;

  @ApiProperty()
  content: string;
}
