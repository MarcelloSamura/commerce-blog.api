import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Get, Post, Query } from '@nestjs/common';

import { Public } from 'src/shared/decorators/auth.decorator';
import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { LoggedInUserIdDecorator } from 'src/shared/decorators/logged-in-user-id.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';

import { PostLikeService } from '../services/post-like.service';
import { PaginatePostLikesDTO } from '../dtos/paginate-post-likes.dto';

@ApiTags('post-like')
@Controller('post-like')
export class PostLikeController {
  constructor(private readonly postLikeService: PostLikeService) {}

  @Public()
  @ApiPaginationQuery()
  @Get('paginate')
  paginate(@Query() queries: PaginatePostLikesDTO) {
    return this.postLikeService.paginatePostLikes(queries);
  }

  @Post(':post_id')
  like(
    @UuidParam('post_id') post_id: string,
    @LoggedInUserIdDecorator() logged_in_user_id: string,
  ) {
    return this.postLikeService.likePost(post_id, logged_in_user_id);
  }

  @Delete(':post_id')
  dislike(
    @UuidParam('post_id') post_id: string,
    @LoggedInUserIdDecorator() logged_in_user_id: string,
  ) {
    return this.postLikeService.removeLike(post_id, logged_in_user_id);
  }
}
