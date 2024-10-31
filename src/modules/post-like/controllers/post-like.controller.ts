import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

import { PostLikeService } from '../services/post-like.service';

@ApiTags('post-like')
@Controller('post-like')
export class PostLikeController {
  constructor(private readonly postLikeService: PostLikeService) {}
}
