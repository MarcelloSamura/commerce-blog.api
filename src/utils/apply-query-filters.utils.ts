import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { isNullableValue } from './is-nullable-value.util';

export type DbExpression = 'LIKE' | '=' | '<' | '>' | '<=' | '>=';
export type Filter<E extends ObjectLiteral> = Record<
  keyof E,
  Maybe<string | number | Date | boolean>
>;

export function applyQueryFilters<
  Alias extends string,
  Entity extends ObjectLiteral,
  Filters extends Partial<Filter<Entity>>,
  FilterType extends Record<keyof Filters, DbExpression>,
>(
  alias: Alias,
  queryBuilder: SelectQueryBuilder<Entity>,
  filters: Filters,
  filters_types: FilterType,
  isFirstConditionAndWhere = false,
) {
  if (Object.values(filters).every((value) => isNullableValue(value))) return;

  let index: number = 0;

  for (const [filter, value] of Object.entries(filters) as [
    keyof Filters,
    Filters[keyof Filters],
  ][]) {
    if (isNullableValue(value)) continue;

    const stringfyedFilterKey = String(filter);
    const filterType = filters_types[filter] as DbExpression;
    const parameterKey = `${stringfyedFilterKey}_${index}`;
    const aliasWithFilter = `${alias}.${stringfyedFilterKey}`;
    const condition = `${filterType === 'LIKE' ? `LOWER(${aliasWithFilter})` : aliasWithFilter} ${filterType} :${parameterKey}`;

    if (!filterType) {
      throw new Error(
        `Invalid filter type provided for filter: ${stringfyedFilterKey}`,
      );
    }

    queryBuilder[
      index === 0 && !isFirstConditionAndWhere ? 'where' : 'andWhere'
    ](condition, {
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

export interface BetweenFilters<DateVal = Maybe<string | Date>> {
  start: DateVal;
  end: DateVal;
  isAndWhere?: boolean;
}

export function applyBetweenFilters<
  Alias extends string,
  E extends ObjectLiteral,
>(
  alias: Alias,
  queryBuilder: SelectQueryBuilder<E>,
  field: keyof E,
  { end, start, isAndWhere = true }: BetweenFilters,
) {
  if (end && start) {
    const datefyedEnd = new Date(end);
    const datefyedStart = new Date(start);

    queryBuilder[isAndWhere ? 'andWhere' : 'where'](
      `${alias}.${String(field)} BETWEEN :start AND :end`,
      {
        start: datefyedStart,
        end: datefyedEnd,
      },
    );
  } else if (start) {
    applyQueryFilters(
      alias,
      queryBuilder,
      { [field]: start } as Partial<Filter<E>>,
      { [field]: '>=' as DbExpression } as Record<keyof E, DbExpression>,
    );
  } else if (end) {
    applyQueryFilters(
      alias,
      queryBuilder,
      { [field]: end } as Partial<Filter<E>>,
      { [field]: '<=' as DbExpression } as Record<keyof E, DbExpression>,
    );
  }

  return queryBuilder;
}
