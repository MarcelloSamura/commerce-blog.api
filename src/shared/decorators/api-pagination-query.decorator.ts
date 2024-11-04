import { ApiQuery, type ApiQueryOptions } from '@nestjs/swagger';

import { IS_DEV_ENV } from '../../config/env.config';

export type Params = ApiQueryOptions[];

export function ApiPaginationQuery(
  params?: Params,
  hideOrderBy = false,
): MethodDecorator {
  return (target, key, descriptor) => {
    if (!IS_DEV_ENV) return;

    ApiQuery({
      type: 'number',
      description:
        'The limit of items. If not passed the default limit will be 10',
      required: false,
      name: 'limit',
      example: 10,
    })(target, key, descriptor);

    ApiQuery({
      type: 'number',
      description: 'The Current Page. If not passed the default page will be 1',
      required: false,
      name: 'page',
      example: 1,
    })(target, key, descriptor);

    if (!hideOrderBy) {
      ApiQuery({
        description: 'Sort field',
        required: false,
        name: 'sort',
        schema: { example: 'created_at.ASC' },
      })(target, key, descriptor);
    }

    if (!params || !params.length) return;

    for (const param of params) {
      ApiQuery(param)(target, key, descriptor);
    }
  };
}
