import {
  Body,
  Controller,
  Delete,
  Get,
  Post as PostRequest,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { User } from 'src/modules/user/entities/user.entity';
import { Public } from '../../../shared/decorators/auth.decorator';
import { UuidParam } from '../../../shared/decorators/uuid-param.decorator';
import { ApiPaginationQuery } from '../../../shared/decorators/api-pagination-query.decorator';
import { LoggedInUserIdDecorator } from '../../../shared/decorators/logged-in-user-id.decorator';

import type { Post } from '../entities/post.entity';
import { PostService } from '../services/post.service';
import { CreatePostDTO } from '../dtos/create-post.dto';
import { UpdatePostDTO } from '../dtos/update-post.dto';
import { PaginatePostsDTO } from '../dtos/paginate-posts.dto';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Public()
  @ApiPaginationQuery()
  @Get('paginate')
  paginate(
    @Query() queries: PaginatePostsDTO,
    @LoggedInUserIdDecorator() logged_in_user?: User['id'],
  ) {
    return this.postService.paginatePosts(queries, logged_in_user);
  }

  @Public()
  @Get(':id')
  getOne(
    @UuidParam('id') id: Post['id'],
    @LoggedInUserIdDecorator() logged_in_user_id?: User['id'],
  ) {
    return this.postService.getPostById(id, false, logged_in_user_id);
  }

  @PostRequest()
  create(
    @Body() body: CreatePostDTO,
    @LoggedInUserIdDecorator() logged_in_user: User['id'],
  ) {
    return this.postService.createPost(body, logged_in_user);
  }

  @Put(':id')
  update(
    @UuidParam('id') id: Post['id'],
    @Body() body: UpdatePostDTO,
    @LoggedInUserIdDecorator() logged_in_user: User['id'],
  ) {
    return this.postService.updatePost(id, body, logged_in_user);
  }

  @Delete(':id')
  delete(
    @UuidParam('id') id: Post['id'],
    @LoggedInUserIdDecorator() logged_in_user: User['id'],
  ) {
    return this.postService.deletePost(id, logged_in_user);
  }
}
