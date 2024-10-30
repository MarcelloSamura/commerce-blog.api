import { ApiQuery, type ApiQueryOptions } from '@nestjs/swagger';

import { IS_DEV_ENV } from 'src/config/env.config';

import { OrderByEnum } from '../enums.shared';

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
        type: 'enum',
        description: 'Order By Created At',
        required: false,
        name: 'order_by_created_at',
        enum: OrderByEnum,
      })(target, key, descriptor);

      ApiQuery({
        type: 'enum',
        description: 'Order By Updated At',
        required: false,
        name: 'order_by_updated_at',
        enum: OrderByEnum,
      })(target, key, descriptor);
    }

    if (!params || !params.length) return;

    for (const param of params) {
      ApiQuery(param)(target, key, descriptor);
    }
  };
}
