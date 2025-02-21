import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { PostModule } from '../post/post.module';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';
import { UserDomainService } from './services/user-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PostModule],
  exports: [UserService, UserDomainService, UserRepository],
  providers: [UserService, UserDomainService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
