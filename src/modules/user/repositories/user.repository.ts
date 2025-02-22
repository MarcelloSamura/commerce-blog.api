import {
  type Repository,
  type UpdateResult,
  type SelectQueryBuilder,
  type DeleteResult,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  applyQueryFilters,
  applySortingFilter,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';

import {
  alias,
  base_fields,
  User,
  type UserSelectKey,
} from '../entities/user.entity';
import type { PaginateUsersPayload } from '../dtos/paginate-users.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User) repository: Repository<User>,
    private readonly paginationService: PaginationService,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public createUserQueryBuilder(
    selectPassword?: boolean,
  ): SelectQueryBuilder<User> {
    const baseQueryBuilder = this.createQueryBuilder(alias);

    if (selectPassword) {
      baseQueryBuilder.select([
        ...base_fields,
        'user.hashed_password',
      ] as UserSelectKey[]);
    } else {
      baseQueryBuilder.select(base_fields);
    }

    return baseQueryBuilder;
  }

  public async findUserByEmail(
    user_email: string,
    selectPassword = true,
  ): Promise<NullableValue<User>> {
    const user = await this.createUserQueryBuilder(selectPassword)
      .where(`${alias}.user_email = :user_email`, { user_email })
      .getOne();

    return user;
  }

  public async findUserById(
    id: User['id'],
    selectPassword = false,
  ): Promise<NullableValue<User>> {
    const user = await this.createUserQueryBuilder(selectPassword)
      .where(`${alias}.id = :id`, { id })
      .getOne();

    return user;
  }

  public async paginateUsers({
    limit,
    page,
    sort,
    ...userPayload
  }: PaginateUsersPayload): Promise<PaginatedResult<User>> {
    const queryBuilder = this.createUserQueryBuilder();

    applyQueryFilters(alias, queryBuilder, userPayload, {
      user_name: 'LIKE',
      user_email: '=',
    });

    applySortingFilter(alias, queryBuilder, sort);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  public async saveUser(user: User): Promise<User> {
    return this.save(user);
  }

  public async updateUser(
    id: User['id'],
    userItem: Partial<User>,
  ): Promise<UpdateResult> {
    return this.update(id, userItem);
  }

  public async deleteUserById(id: User['id']): Promise<DeleteResult> {
    return this.delete(id);
  }
}
