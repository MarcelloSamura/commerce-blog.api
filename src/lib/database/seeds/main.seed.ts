/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from 'typeorm';
import {
  type Seeder,
  SeederFactoryManager,
  runSeeder,
} from 'typeorm-extension';

import { UserSeeder } from './seeders';

export class MainSeeder implements Seeder {
  track?: boolean | undefined = true;

  async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await runSeeder(dataSource, UserSeeder);
  }
}
