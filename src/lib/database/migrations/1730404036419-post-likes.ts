import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

import { baseColumns } from '../entities/base-columns';

export class PostLikes1730404036419 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post-likes',
        columns: [
          ...baseColumns,
          {
            name: 'post_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'post-likes',
      new TableIndex({
        name: 'IDX_POST_ID',
        columnNames: ['post_id'],
      }),
    );

    await queryRunner.createIndex(
      'post-likes',
      new TableIndex({
        name: 'IDX_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'post-likes',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedTableName: 'posts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post-likes',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = (await queryRunner.getTable('post-likes')) as Table;

    const postForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('post_id') !== -1,
    );
    const userForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );

    if (postForeignKey)
      await queryRunner.dropForeignKey('post-likes', postForeignKey);
    if (userForeignKey)
      await queryRunner.dropForeignKey('post-likes', userForeignKey);

    await queryRunner.dropIndex('post-likes', 'IDX_POST_ID');
    await queryRunner.dropIndex('post-likes', 'IDX_USER_ID');

    await queryRunner.dropTable('post-likes');
  }
}
