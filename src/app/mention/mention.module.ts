import { Module } from '@nestjs/common';
import { MentionService } from './mention.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [MentionService],
  exports: [MentionService],
})
export class MentionModule {}
