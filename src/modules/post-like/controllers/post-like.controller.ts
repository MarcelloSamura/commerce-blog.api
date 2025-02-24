import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  Post as PostRequest,
  Query,
} from '@nestjs/common';

import type { Post } from 'src/modules/post/entities/post.entity';
import type { User } from 'src/modules/user/entities/user.entity';

import { Public } from '../../../shared/decorators/auth.decorator';
import { UuidParam } from '../../../shared/decorators/uuid-param.decorator';
import { LoggedInUserIdDecorator } from '../../../shared/decorators/logged-in-user-id.decorator';
import { ApiPaginationQuery } from '../../../shared/decorators/api-pagination-query.decorator';

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

  @PostRequest(':post_id')
  like(
    @UuidParam('post_id') post_id: Post['id'],
    @LoggedInUserIdDecorator() logged_in_user_id: User['id'],
  ) {
    return this.postLikeService.likePost(post_id, logged_in_user_id);
  }

  @Delete(':post_id')
  dislike(
    @UuidParam('post_id') post_id: Post['id'],
    @LoggedInUserIdDecorator() logged_in_user_id: User['id'],
  ) {
    return this.postLikeService.removeLike(post_id, logged_in_user_id);
  }
}
