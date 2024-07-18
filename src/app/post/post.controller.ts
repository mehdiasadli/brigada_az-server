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
import { IncomingQueryParams } from 'src/lib/utils/queryParser';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Auth()
  @Get('feed')
  async feed(
    @UserId() currentUserId: string,
    @Query() query: IncomingQueryParams,
  ) {
    return await this.postService.feed(currentUserId, query);
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
