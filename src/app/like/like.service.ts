import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IncomingQueryParams,
  queryHandler,
  queryParser,
} from 'src/lib/utils/queryParser';
import { Like } from '@prisma/client';
import { publicUserForPost } from 'src/lib/utils/publicUser';
import { getPaginationInfo } from 'src/lib/utils/getPaginationInfo';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  private async createLike(postId: string, currentUserId: string) {
    return await this.prisma.like.create({
      data: {
        postId,
        userId: currentUserId,
      },
    });
  }

  private async removeLike(likeId: string) {
    return await this.prisma.like.delete({
      where: {
        id: likeId,
      },
    });
  }

  private async getLikedUser(postId: string, currentUserId: string) {
    return await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          postId,
          userId: currentUserId,
        },
      },
    });
  }

  async like(postId: string, currentUserId: string) {
    const existing = await this.getLikedUser(postId, currentUserId);

    if (!existing) {
      return await this.createLike(postId, currentUserId);
    }

    return await this.removeLike(existing.id);
  }

  async getLikesOfPost(postId: string, query?: IncomingQueryParams) {
    const { where, orderBy, pagination } = queryHandler(
      queryParser<Like>(query),
    );

    const likes = await this.prisma.like.findMany({
      where: {
        postId,
        ...where,
      },
      orderBy,
      ...(pagination ? { take: pagination.limit, skip: pagination.skip } : {}),
      include: {
        user: {
          select: publicUserForPost,
        },
      },
    });

    if (pagination === undefined) {
      return likes;
    }

    const total = await this.prisma.post.count({
      where,
      orderBy,
    });

    return {
      meta: getPaginationInfo(total, likes, pagination.page, pagination.limit),
      data: likes,
    };
  }
}
