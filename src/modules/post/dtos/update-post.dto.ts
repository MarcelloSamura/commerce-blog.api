import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  stringSchema,
  optionalUrlStringSchema,
  optionalStringSchema,
} from 'src/shared/schemas.shared';

import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { postContentMaxLength } from '../entities/post.entity';

export const updatePostSchema = z.object({
  title: optionalStringSchema,
  banner_url: optionalUrlStringSchema,
  content: createNullableTransform(stringSchema.max(postContentMaxLength)),
});

export type UpdatePostPayload = z.infer<typeof updatePostSchema>;

export class UpdatePostDTO extends createZodDto(updatePostSchema) {
  @ApiPropertyOptional({
    example: 'Título 1',
  })
  title?: string;

  @ApiPropertyOptional({
    example: 'conteudo do post',
  })
  content?: string;

  @ApiPropertyOptional()
  banner_url?: string;
}
