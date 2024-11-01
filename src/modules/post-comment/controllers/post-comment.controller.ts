import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Public } from 'src/shared/decorators/auth.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';

import { PostCommentService } from '../services/post-comment.service';
import { PaginatePostCommentsDTO } from '../dtos/paginate-post-comments.dto';
import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { CreatePostCommentDTO } from '../dtos/create-post-comment.dto';
import { LoggedInUserIdDecorator } from 'src/shared/decorators/logged-in-user-id.decorator';
import { UpdatePostCommentDTO } from '../dtos/update-post-comment.dto';

@ApiTags('post-comment')
@Controller('post-comment')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @Public()
  @ApiPaginationQuery()
  @Get('paginate')
  paginate(@Query() queries: PaginatePostCommentsDTO) {
    return this.postCommentService.paginatePostComments(queries);
  }

  @Get(':id')
  getOne(@UuidParam('id') id: string) {
    return this.postCommentService.getPostCommentById(id);
  }

  @Post('')
  create(
    @Body() body: CreatePostCommentDTO,
    @LoggedInUserIdDecorator() logged_in_user_id: string,
  ) {
    return this.postCommentService.createPostComment(body, logged_in_user_id);
  }

  @Put(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdatePostCommentDTO,
    @LoggedInUserIdDecorator() logged_in_user_id: string,
  ) {
    return this.postCommentService.updatePostComment(
      id,
      body,
      logged_in_user_id,
    );
  }

  @Delete(':id')
  delete(
    @UuidParam('id') id: string,
    @LoggedInUserIdDecorator() logged_in_user_id: string,
  ) {
    return this.postCommentService.deletePostComment(id, logged_in_user_id);
  }
}
