import { Injectable } from '@nestjs/common';

import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';

import { User } from '../entities/user.entity';
import type { CreateUserPayload } from '../dtos/create-user.dto';
import type { UpdateUserPayload } from '../dtos/update-user.dto';

@Injectable()
export class UserDomainService {
  private async handleCreateHashedPassword(password: string): Promise<string> {
    return import('../../../utils/password.utils').then(
      ({ createHashedPassword }) => createHashedPassword(password),
    );
  }

  public async createUserEntity({
    password,
    ...payload
  }: CreateUserPayload): Promise<User> {
    const userItem = new User();

    const hashed_password = password
      ? await this.handleCreateHashedPassword(password)
      : null;

    Object.assign(userItem, { ...payload, hashed_password });

    return userItem;
  }

  public async updateUserEntity(
    { new_password, previous_password, ...payload }: UpdateUserPayload,
    database_password: string,
  ): Promise<User> {
    const userItem = new User();

    if (new_password) {
      if (!previous_password) {
        throw new BadRequestError(
          'A senha anterior é necessária ao definir uma nova senha.',
        );
      }

      const { validatePassword } = await import(
        '../../../utils/password.utils'
      );

      const isMatch = await validatePassword(
        previous_password,
        database_password,
      );

      if (!isMatch)
        throw new BadRequestError('A senha anterior está incorreta.');

      userItem.hashed_password =
        await this.handleCreateHashedPassword(new_password);
    }

    Object.assign(userItem, payload);

    return userItem;
  }
}
