import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { stringSchema } from '../../../shared/schemas.shared';
import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { postCommentContentMaxLength } from '../entities/post-comment.entity';

export const updatePostCommentSchema = z.object({
  content: createNullableTransform(
    stringSchema.max(postCommentContentMaxLength),
  ),
});

export type UpdatePostCommentPayload = z.infer<typeof updatePostCommentSchema>;

export class UpdatePostCommentDTO extends createZodDto(
  updatePostCommentSchema,
) {
  @ApiPropertyOptional()
  content?: string;
}
