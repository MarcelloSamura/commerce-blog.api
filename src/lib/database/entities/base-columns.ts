import type { TableColumnOptions } from 'typeorm';

export const dateColumns = [
  {
    name: 'created_at',
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
  },
  {
    name: 'updated_at',
    type: 'timestamp',
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
    isNullable: true,
  },
] as const;

export const baseColumns = [
  {
    name: 'id',
    type: 'uuid',
    generationStrategy: 'uuid',
    isPrimary: true,
    default: 'uuid_generate_v4()',
  },
  ...dateColumns,
] satisfies TableColumnOptions[];

export const baseColumnsWithIncrementalId = [
  {
    name: 'id',
    type: 'int',
    isPrimary: true,
    isGenerated: true,
    generationStrategy: 'increment',
  },
  ...dateColumns,
] satisfies TableColumnOptions[];
