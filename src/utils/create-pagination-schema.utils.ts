import { type ZodRawShape, z } from 'nestjs-zod/z';

import {
  optionalOrderParamSchema,
  optionalPaginationParamSchema,
} from 'src/shared/schemas.shared';

const pageSchema = optionalPaginationParamSchema.default(1);
const limitSchema = optionalPaginationParamSchema.default(10);

export function createPaginationSchema<T extends ZodRawShape>(fields: T) {
  const paginationSchema = z.object({
    page: pageSchema,
    limit: limitSchema,
    order_by_created_at: optionalOrderParamSchema,
    order_by_updated_at: optionalOrderParamSchema,
    ...fields,
  });

  return paginationSchema;
}

export function createPaginationSchemaWithoutOrderBy<T extends ZodRawShape>(
  fields: T,
) {
  const paginationSchema = z.object({
    page: pageSchema,
    limit: limitSchema,
    ...fields,
  });

  return paginationSchema;
}
