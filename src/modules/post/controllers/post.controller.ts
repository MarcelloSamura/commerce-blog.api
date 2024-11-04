import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/auth.decorator';
import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';
import { LoggedInUserIdDecorator } from 'src/shared/decorators/logged-in-user-id.decorator';

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
    @LoggedInUserIdDecorator() logged_in_user?: string,
  ) {
    return this.postService.paginatePosts(queries, logged_in_user);
  }

  @Public()
  @Get(':id')
  getOne(
    @UuidParam('id') id: string,
    @LoggedInUserIdDecorator() logged_in_user_id?: string,
  ) {
    return this.postService.getPostById(id, false, logged_in_user_id);
  }

  @Post()
  create(
    @Body() body: CreatePostDTO,
    @LoggedInUserIdDecorator() logged_in_user: string,
  ) {
    return this.postService.createPost(body, logged_in_user);
  }

  @Put(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdatePostDTO,
    @LoggedInUserIdDecorator() logged_in_user: string,
  ) {
    return this.postService.updatePost(id, body, logged_in_user);
  }

  @Delete(':id')
  delete(
    @UuidParam('id') id: string,
    @LoggedInUserIdDecorator() logged_in_user: string,
  ) {
    return this.postService.deletePost(id, logged_in_user);
  }
}
