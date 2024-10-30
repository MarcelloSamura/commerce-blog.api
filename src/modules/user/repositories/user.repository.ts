import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { User } from '../entities/user.entity';

export const userRepository: Repository<User> =
  AppDataSource.getRepository(User);
