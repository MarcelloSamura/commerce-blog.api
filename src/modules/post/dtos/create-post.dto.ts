import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  stringSchema,
  optionalUrlStringSchema,
} from 'src/shared/schemas.shared';

import { postContentMaxLength } from '../entities/post.entity';

export const createPostSchema = z.object({
  title: stringSchema,
  banner_url: optionalUrlStringSchema,
  content: stringSchema.max(postContentMaxLength),
});

export type CreatePostPayload = z.infer<typeof createPostSchema>;

export class CreatePostDTO extends createZodDto(createPostSchema) {
  @ApiProperty({
    example: 'Título 1',
  })
  title: string;

  @ApiProperty({
    example: 'conteudo do post',
  })
  content: string;

  @ApiPropertyOptional()
  banner_url?: string;
}
