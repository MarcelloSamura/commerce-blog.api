import { BadRequestException, Injectable } from '@nestjs/common';

import {
  validatePassword,
  createHashedPassword,
} from 'src/utils/password.utils';

import { User } from '../entities/user.entity';
import type { CreateUserPayload } from '../dtos/create-user.dto';
import type { UpdateUserPayload } from '../dtos/update-user.dto';

@Injectable()
export class UserDomainService {
  private async createHashedPassword(password: string): Promise<string> {
    return createHashedPassword(password);
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return validatePassword(password, hashedPassword);
  }

  public async createUserEntity({
    password,
    ...payload
  }: CreateUserPayload): Promise<User> {
    const userItem = new User();

    const hashed_password = password
      ? await this.createHashedPassword(password)
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
        throw new BadRequestException(
          'A senha anterior é necessária ao definir uma nova senha.',
        );
      }

      const isMatch = await this.validatePassword(
        previous_password,
        database_password,
      );

      if (!isMatch)
        throw new BadRequestException('A senha anterior está incorreta.');

      userItem.hashed_password = await this.createHashedPassword(new_password);
    }

    Object.assign(userItem, payload);

    return userItem;
  }
}
