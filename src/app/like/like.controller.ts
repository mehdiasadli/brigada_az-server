import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LikeService } from './like.service';
import { Auth } from 'src/lib/decorators/auth.decorator';
import { IncomingQueryParams } from 'src/lib/utils/queryParser';
import { UserId } from 'src/lib/decorators/user.decorator';

@Controller('likes')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Auth()
  @Post(':postId')
  async like(@Param('postId') postId: string, @UserId() currentUserId: string) {
    return await this.likeService.like(postId, currentUserId);
  }

  @Auth()
  @Get('post/:postId')
  async getLikesOfPost(
    @Param('postId') postId: string,
    @Query() query?: IncomingQueryParams,
  ) {
    return await this.likeService.getLikesOfPost(postId, query);
  }
}
