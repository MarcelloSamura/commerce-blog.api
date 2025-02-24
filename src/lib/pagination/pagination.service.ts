import type {
  ObjectLiteral,
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class PaginationService {
  public async paginate<T extends ObjectLiteral>(
    entityRepository: Repository<T>,
    { limit, page, ...options }: PaginationArgs,
    searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
  ): Promise<PaginatedResult<T>> {
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
  ): Promise<PaginatedResult<T>> {
    return paginate<T>(queryBuilder, {
      ...options,
      limit,
      page,
    });
  }
}
