import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { optionalUuidSchema } from '../../../shared/schemas.shared';
import { createPaginationSchema } from '../../../utils/create-pagination-schema.utils';

export const paginatePostLikesSchema = createPaginationSchema({
  post_id: optionalUuidSchema,
  user_id: optionalUuidSchema,
}).refine(({ post_id, user_id }) => post_id || user_id, {
  message: 'Insira o id do usuário ou o id do post',
});

export type PaginatePostLikesPayload = z.infer<typeof paginatePostLikesSchema>;

export class PaginatePostLikesDTO extends createZodDto(
  paginatePostLikesSchema,
) {
  @ApiPropertyOptional({
    description: 'ID do post a ser paginado',
    type: 'string',
    format: 'uuid',
  })
  post_id?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário a ser paginado',
    type: 'string',
    format: 'uuid',
  })
  user_id?: string;
}
