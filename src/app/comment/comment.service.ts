import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TAddCommentDto } from './dto/create-comment.dto';
import {
  IncomingQueryParams,
  queryHandler,
  queryParser,
} from 'src/lib/utils/queryParser';
import { publicUserForPost } from 'src/lib/utils/publicUser';
import { getPaginationInfo } from 'src/lib/utils/getPaginationInfo';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment(
    postId: string,
    currentUserId: string,
    addCommentDto: TAddCommentDto,
  ) {
    return await this.prisma.comment.create({
      data: {
        authorId: currentUserId,
        postId: postId,
        ...addCommentDto,
      },
    });
  }

  async getCommentOfPost(postId: string, query?: IncomingQueryParams) {
    const { where, orderBy, pagination } = queryHandler(queryParser(query));

    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        ...where,
      },
      orderBy,
      ...(pagination ? { take: pagination.limit, skip: pagination.skip } : {}),
      include: {
        author: {
          select: publicUserForPost,
        },
      },
    });

    if (pagination === undefined) {
      return comments;
    }

    const total = await this.prisma.post.count({
      where,
      orderBy,
    });

    return {
      meta: getPaginationInfo(
        total,
        comments,
        pagination.page,
        pagination.limit,
      ),
      data: comments,
    };
  }
}
