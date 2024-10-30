import { Module } from '@nestjs/common';

import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
