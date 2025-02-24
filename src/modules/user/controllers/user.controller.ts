import {
  Body,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Controller,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../../../shared/decorators/auth.decorator';
import { UuidParam } from '../../../shared/decorators/uuid-param.decorator';
import { ApiPaginationQuery } from '../../../shared/decorators/api-pagination-query.decorator';
import { LoggedInUserIdDecorator } from '../../../shared/decorators/logged-in-user-id.decorator';

import type { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { PaginateUsersDTO } from '../dtos/paginate-users.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @ApiPaginationQuery()
  @Get('paginate')
  async paginate(@Query() querys: PaginateUsersDTO) {
    return this.userService.paginateUsers(querys);
  }

  @Public()
  @Get(':id')
  async getOne(@UuidParam('id') id: User['id']) {
    return this.userService.getUserById(id, false);
  }

  @Public()
  @Post('')
  async create(@Body() body: CreateUserDTO) {
    return this.userService.createUser(body);
  }

  @Put(':id')
  async update(
    @UuidParam('id') id: User['id'],
    @Body() payload: UpdateUserDTO,
    @LoggedInUserIdDecorator() logged_in_user_id: User['id'],
  ) {
    return this.userService.updateUser(id, payload, logged_in_user_id);
  }

  @Delete(':id')
  async delete(
    @UuidParam('id') id: User['id'],
    @LoggedInUserIdDecorator() logged_in_user_id: User['id'],
  ) {
    return this.userService.deleteUser(id, logged_in_user_id);
  }
}
