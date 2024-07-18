import { Module } from '@nestjs/common';
import { FollowshipService } from './followship.service';
import { FollowshipController } from './followship.controller';

@Module({
  providers: [FollowshipService],
  controllers: [FollowshipController],
})
export class FollowshipModule {}
