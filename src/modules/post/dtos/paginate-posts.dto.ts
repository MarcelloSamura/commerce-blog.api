import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalUuidSchema,
  optionalStringSchemaToLowerCase,
} from '../../../shared/schemas.shared';
import { createPaginationSchema } from '../../../utils/create-pagination-schema.utils';

export const paginatePostsSchema = createPaginationSchema({
  title: optionalStringSchemaToLowerCase,
  author_id: optionalUuidSchema,
});

export type PaginatePostsPayload = z.infer<typeof paginatePostsSchema>;

export class PaginatePostsDTO extends createZodDto(paginatePostsSchema) {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  author_id?: string;
}
