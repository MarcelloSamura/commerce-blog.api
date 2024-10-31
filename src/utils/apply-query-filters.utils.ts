import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { isNullableValue } from './is-nullable-value.util';

export type FilterTypes = 'LIKE' | '=' | '<' | '>' | '<=' | '>=';
export type Filter = Record<string, Maybe<string | number | Date | boolean>>;

export function applyQueryFilters<
  Alias extends string,
  Entity extends ObjectLiteral,
  Filters extends Filter,
  FilterType extends Record<keyof Filters, FilterTypes>,
>(
  alias: Alias,
  queryBuilder: SelectQueryBuilder<Entity>,
  filters: Filters,
  filters_types: FilterType,
) {
  if (Object.keys(filters).length === 0) return;

  let index: number = 0;

  for (const [filter, value] of Object.entries(filters) as [
    keyof Filters,
    Filters[keyof Filters],
  ][]) {
    if (isNullableValue(value)) continue;

    const stringfyedFilterKey = String(filter);
    const filterType = filters_types[filter] as FilterTypes;
    const parameterKey = `${stringfyedFilterKey}_${index}`;
    const aliasWithFilter = `${alias}.${stringfyedFilterKey}`;
    const condition = `${filterType === 'LIKE' ? `LOWER(${aliasWithFilter})` : aliasWithFilter} ${filterType} :${parameterKey}`;

    if (!filterType) {
      throw new Error(
        `Invalid filter type provided for filter: ${stringfyedFilterKey}`,
      );
    }

    queryBuilder[index === 0 ? 'where' : 'andWhere'](condition, {
      [parameterKey]:
        filterType === 'LIKE' && typeof value === 'string'
          ? `%${value}%`
          : value,
    });

    index++;
  }

  return queryBuilder;
}

type OrderBy = 'ASC' | 'DESC' | 'asc' | 'desc';

export type Order<E extends ObjectLiteral> =
  | `${Extract<keyof E, string | number>}.${OrderBy}`
  | string;

export function applyOrderByFilters<T extends string, E extends ObjectLiteral>(
  alias: T,
  queryBuilder: SelectQueryBuilder<E>,
  sort: Maybe<Order<E>>,
) {
  if (!sort) return;

  const [column, order] = sort.split('.') as [
    Extract<keyof E, string | number>,
    OrderBy,
  ];

  if (
    !queryBuilder.expressionMap.mainAlias?.metadata.findColumnWithPropertyPath(
      column as string,
    )
  ) {
    return;
  }

  queryBuilder.orderBy(
    `${alias}.${column}`,
    order.toUpperCase() as 'ASC' | 'DESC',
  );
}
