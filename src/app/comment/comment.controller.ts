import { IncomingQueryParams } from 'src/lib/utils/queryParser';
import { Zod } from 'src/lib/pipes/zod.pipe';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Auth } from 'src/lib/decorators/auth.decorator';
import { UserId } from 'src/lib/decorators/user.decorator';
import { AddCommentDto, TAddCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Auth()
  @Post(':postId')
  async addComment(
    @Param('postId') postId: string,
    @UserId() currentUserId: string,
    @Body(Zod.create(AddCommentDto)) body: TAddCommentDto,
  ) {
    return await this.commentService.addComment(postId, currentUserId, body);
  }

  @Auth()
  @Get('post/:postId')
  async getCommentsOfPost(
    @Param('postId') postId: string,
    @Query() query?: IncomingQueryParams,
  ) {
    return await this.commentService.getCommentOfPost(postId, query);
  }
}
