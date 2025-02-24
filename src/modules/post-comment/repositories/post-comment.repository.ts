import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import {
  applyQueryFilters,
  applySortingFilter,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';

import {
  alias,
  base_select_fields,
  base_select_fields_with_post,
  commented_by_alias,
  postAlias,
  PostComment,
} from '../entities/post-comment.entity';
import type { PaginatePostCommentsPayload } from '../dtos/paginate-post-comments.dto';

@Injectable()
export class PostCommentRepository extends Repository<PostComment> {
  constructor(
    @InjectRepository(PostComment) repository: Repository<PostComment>,
    private readonly paginationService: PaginationService,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public createPostCommentQueryBuilder(): SelectQueryBuilder<PostComment> {
    return this.createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.${commented_by_alias}`, commented_by_alias)
      .select(base_select_fields);
  }

  public createPostCommentWithPost() {
    return this.createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.${postAlias}`, postAlias)
      .select(base_select_fields_with_post);
  }

  async paginatePostComments({
    limit,
    page,
    sort,
    commented_by_id,
    skip,
    ...rest
  }: PaginatePostCommentsPayload) {
    const queryBuilder = this.createPostCommentQueryBuilder();

    applyQueryFilters(alias, queryBuilder, rest, {
      parent_id: '=',
      post_id: '=',
    });
    applyQueryFilters(
      commented_by_alias,
      queryBuilder,
      { id: commented_by_id },
      { id: '=' },
      true,
    );

    applySortingFilter(alias, queryBuilder, sort);

    if (skip) queryBuilder.skip(skip);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      page,
      limit,
    });
  }

  async getPostCommentById(id: PostComment['id']) {
    const postComment = await this.createPostCommentQueryBuilder()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!postComment) throw new NotFoundException('Comentário inválido');

    return postComment;
  }

  async getPostCommentByIdWithRelatedPost(id: PostComment['id']) {
    const postComment = await this.createPostCommentWithPost()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!postComment) throw new NotFoundException('Comentário inválido');

    return postComment;
  }
}
