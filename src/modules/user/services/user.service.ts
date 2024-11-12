import { del } from '@vercel/blob';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from '../../../utils/apply-query-filters.utils';
import { PostService } from '../../post/services/post.service';
import { PaginationService } from '../../../lib/pagination/pagination.service';
import { NotFoundError } from '../../../lib/http-exceptions/errors/types/not-found-error';

import {
  User,
  alias,
  base_fields,
  type UserSelectKey,
} from '../entities/user.entity';
import type { CreateUserPayload } from '../dtos/create-user.dto';
import type { UpdateUserPayload } from '../dtos/update-user.dto';
import type { PaginateUsersPayload } from '../dtos/paginate-users.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly postService: PostService,
    private readonly paginationService: PaginationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private createUserQueryBuilder(selectPassword?: boolean) {
    const baseQueryBuilder = this.userRepository.createQueryBuilder(alias);

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

  async paginateUsers({
    limit,
    page,
    sort,
    ...userPayload
  }: PaginateUsersPayload) {
    const queryBuilder = this.createUserQueryBuilder();

    applyQueryFilters(alias, queryBuilder, userPayload, {
      user_name: 'LIKE',
      user_email: '=',
    });

    applyOrderByFilters(alias, queryBuilder, sort);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  async getUserByEmail(user_email: string, selectPassword = true) {
    const user = await this.createUserQueryBuilder(selectPassword)
      .where(`${alias}.user_email = :user_email`, { user_email })
      .getOne();

    if (!user) throw new NotFoundError('Email is not valid!');

    return user;
  }

  async getUserById(id: string, selectPassword?: boolean) {
    const user = await this.createUserQueryBuilder(selectPassword)
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!user) throw new NotFoundError('User not found!');

    return user;
  }

  private checkUserPermission(user: User, logged_in_user_id: string) {
    if (user.id !== logged_in_user_id) {
      throw new ForbiddenException(
        'Não é permitido alterar ou deletar um usuario que não é seu',
      );
    }
  }

  private async getUserAndCheckPermission(
    id: string,
    logged_in_user_id: string,
  ) {
    const user = await this.getUserById(id);

    this.checkUserPermission(user, logged_in_user_id);

    return user;
  }

  async createUser(payload: CreateUserPayload) {
    const userToCreate = await User.create(payload);

    return this.userRepository.save(userToCreate);
  }

  async updateUser(
    id: string,
    payload: UpdateUserPayload,
    logged_in_user_id: string,
  ) {
    const userToUpdate = await this.getUserAndCheckPermission(
      id,
      logged_in_user_id,
    );

    if (payload.user_photo_url && userToUpdate.user_photo_url) {
      await del(userToUpdate.user_photo_url);
    }

    const userItem = await User.update(payload, userToUpdate.hashed_password);

    return this.userRepository.update(userToUpdate.id, userItem);
  }

  async deleteUser(id: string, logged_in_user_id: string) {
    const userToDelete = await this.getUserAndCheckPermission(
      id,
      logged_in_user_id,
    );

    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    try {
      const userPostsImages = await this.postService.getUsersPostsImages(
        userToDelete.id,
      );

      if (userPostsImages.length && !abortSignal.aborted) {
        await Promise.all(
          userPostsImages.map(async (url) => {
            return del(url.banner_url, { abortSignal });
          }),
        );
      }

      const [_, deleteResult] = await Promise.all([
        userToDelete.user_photo_url
          ? del(userToDelete.user_photo_url)
          : undefined,
        this.userRepository.delete(userToDelete.id),
        this.postService.handleDeleteUserLikes(userToDelete.id),
      ]);

      return deleteResult;
    } catch {
      if (abortSignal.aborted) {
        throw new InternalServerErrorException(
          'Não foi possível deletar imagens',
        );
      }
    } finally {
      abortController.abort();
    }
  }
}
