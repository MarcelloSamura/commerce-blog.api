import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  uuidSchema,
  optionalUuidSchema,
  optionalStringToIntegerSchema,
} from '../../../shared/schemas.shared';
import { createPaginationSchema } from '../../../utils/create-pagination-schema.utils';

export const paginatePostCommentsSchema = createPaginationSchema({
  post_id: uuidSchema,
  parent_id: optionalUuidSchema,
  commented_by_id: optionalUuidSchema,
  skip: optionalStringToIntegerSchema,
});

export type PaginatePostCommentsPayload = z.infer<
  typeof paginatePostCommentsSchema
>;

export class PaginatePostCommentsDTO extends createZodDto(
  paginatePostCommentsSchema,
) {
  @ApiProperty()
  post_id: string;

  @ApiPropertyOptional()
  parent_id?: string;

  @ApiPropertyOptional()
  commented_by_id?: string;

  @ApiPropertyOptional({ type: Number, example: '5' })
  skip?: number;
}
