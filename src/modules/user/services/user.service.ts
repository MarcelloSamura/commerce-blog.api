import { del } from '@vercel/blob';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PostService } from '../../post/services/post.service';

import type { User } from '../entities/user.entity';
import { UserDomainService } from './user-domain.service';
import { UserRepository } from '../repositories/user.repository';
import type { CreateUserPayload } from '../dtos/create-user.dto';
import type { UpdateUserPayload } from '../dtos/update-user.dto';
import type { PaginateUsersPayload } from '../dtos/paginate-users.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly postService: PostService,
    private readonly userDomainService: UserDomainService,
    private readonly userRepository: UserRepository,
  ) {}

  async paginateUsers(data: PaginateUsersPayload) {
    return this.userRepository.paginateUsers(data);
  }

  async getUserByEmail(user_email: string, selectPassword = true) {
    const user = await this.userRepository.findUserByEmail(
      user_email,
      selectPassword,
    );

    if (!user) throw new NotFoundException('Email is not valid!');

    return user;
  }

  async getUserById(id: User['id'], selectPassword?: boolean) {
    const user = await this.userRepository.findUserById(id, selectPassword);

    if (!user) throw new NotFoundException('User not found!');

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
    id: User['id'],
    logged_in_user_id: User['id'],
  ) {
    const user = await this.getUserById(id);

    this.checkUserPermission(user, logged_in_user_id);

    return user;
  }

  async createUser(payload: CreateUserPayload) {
    const userToCreate = await this.userDomainService.createUserEntity(payload);

    return this.userRepository.saveUser(userToCreate);
  }

  async updateUser(
    id: User['id'],
    payload: UpdateUserPayload,
    logged_in_user_id: User['id'],
  ) {
    const userToUpdate = await this.getUserAndCheckPermission(
      id,
      logged_in_user_id,
    );

    if (payload.user_photo_url && userToUpdate.user_photo_url) {
      await del(userToUpdate.user_photo_url);
    }

    const userItem = await this.userDomainService.updateUserEntity(
      payload,
      userToUpdate.hashed_password,
    );

    return this.userRepository.update(userToUpdate.id, userItem);
  }

  async deleteUser(id: User['id'], logged_in_user_id: User['id']) {
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
        this.userRepository.deleteUserById(userToDelete.id),
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
