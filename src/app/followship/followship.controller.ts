import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FollowshipService } from './followship.service';
import { Auth } from 'src/lib/decorators/auth.decorator';
import { UserId } from 'src/lib/decorators/user.decorator';
import { IncomingQueryParams } from 'src/lib/utils/queryParser';

@Controller('follow')
export class FollowshipController {
  constructor(private followshipService: FollowshipService) {}

  @Auth()
  @Post(':followingId')
  async follow(
    @Param('followingId') followingId: string,
    @UserId() currentUserId: string,
  ) {
    return await this.followshipService.follow(followingId, currentUserId);
  }

  @Auth()
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query() query?: IncomingQueryParams,
  ) {
    return await this.followshipService.getFollowersOfUser(userId, query);
  }

  @Auth()
  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query() query?: IncomingQueryParams,
  ) {
    return await this.followshipService.getFollowingOfUser(userId, query);
  }
}
