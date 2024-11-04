import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

import { postContentMaxLength } from '../../../modules/post/entities/post.entity';

import { baseColumns } from '../entities/base-columns';

export class PostComments1730468452297 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post-comments',
        columns: [
          ...baseColumns,
          {
            name: 'commented_by_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'varchar',
            length: String(postContentMaxLength),
          },
          {
            name: 'post_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
            default: null,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'post-comments',
      new TableIndex({
        name: 'IDX_post_comments_commented_by_id',
        columnNames: ['commented_by_id'],
      }),
    );

    await queryRunner.createIndex(
      'post-comments',
      new TableIndex({
        name: 'IDX_post_comments_post_id',
        columnNames: ['post_id'],
      }),
    );

    await queryRunner.createIndex(
      'post-comments',
      new TableIndex({
        name: 'IDX_post_comments_parent_id',
        columnNames: ['parent_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'post-comments',
      new TableForeignKey({
        columnNames: ['commented_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post-comments',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post-comments',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'post-comments',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('post-comments');

    const foreignKeys =
      table?.foreignKeys.filter((fk) =>
        ['commented_by_id', 'post_id', 'parent_id'].includes(
          fk.columnNames[0] as string,
        ),
      ) ?? [];

    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('post-comments', fk);
    }

    await queryRunner.dropIndex(
      'post-comments',
      'IDX_post_comments_commented_by_id',
    );
    await queryRunner.dropIndex('post-comments', 'IDX_post_comments_post_id');
    await queryRunner.dropIndex('post-comments', 'IDX_post_comments_parent_id');

    await queryRunner.dropTable('post-comments');
  }
}
