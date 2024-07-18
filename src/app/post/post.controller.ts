import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/lib/decorators/auth.decorator';
import { PostService } from './post.service';
import { Zod } from 'src/lib/pipes/zod.pipe';
import { CreatePostDto, TCreatePostDto } from './dto/create-post.dto';
import { UserId } from 'src/lib/decorators/user.decorator';
import { IncomingQueryParams, queryParser } from 'src/lib/utils/queryParser';
import { Post as IPost } from '@prisma/client';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Auth()
  @Get('feed')
  async feed(@Query() query: IncomingQueryParams) {
    return await this.postService.feed(query);
  }

  @Auth()
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return await this.postService.getPostById(id);
  }

  @Auth()
  @Get('author/:id')
  async getUsersPosts(
    @Param('id') authorId: string,
    @Query() query: IncomingQueryParams,
  ) {
    return await this.postService.getUsersPosts(authorId, query);
  }

  @Auth()
  @Post()
  async create(
    @Body(Zod.create(CreatePostDto)) body: TCreatePostDto,
    @UserId() currentUserId: string,
  ) {
    return await this.postService.create(body, currentUserId);
  }

  @Auth()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.postService.delete(id);
  }
}
