import {
  type IPaginationMeta,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Injectable } from '@nestjs/common';
import {
  type ObjectLiteral,
  Repository,
  type FindOptionsWhere,
  type FindManyOptions,
  SelectQueryBuilder,
} from 'typeorm';

@Injectable()
export class PaginationService {
  public async paginate<T extends ObjectLiteral>(
    entityRepository: Repository<T>,
    { limit, page, ...options }: PaginationArgs,
    searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
  ): Promise<Pagination<T, IPaginationMeta>> {
    return paginate<T>(
      entityRepository,
      {
        ...options,
        limit,
        page,
      },
      searchOptions,
    );
  }

  public async paginateWithQueryBuilder<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    { limit, page, ...options }: PaginationArgs,
  ): Promise<Pagination<T, IPaginationMeta>> {
    return paginate<T>(queryBuilder, {
      ...options,
      limit,
      page,
    });
  }
}
