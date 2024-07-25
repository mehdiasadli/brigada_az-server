import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MentionModule } from '../mention/mention.module';

@Module({
  imports: [MentionModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
