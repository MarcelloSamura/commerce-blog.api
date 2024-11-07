/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from 'typeorm';
import { type Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '../../../../modules/user/entities/user.entity';
import { createHashedPassword } from '../../../../utils/password.utils';

export default class UserSeeder implements Seeder {
  track = false;

  async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    const newUser = userRepository.create({
      user_name: 'Marcello Samura',
      user_email: 'marcellosamura@gmail.com',
      hashed_password: await createHashedPassword('senha123'),
      phone_number: '(19) 98950-7221',
      date_of_birth: '1978-04-17',
    });

    await userRepository.save(newUser);
  }
}
