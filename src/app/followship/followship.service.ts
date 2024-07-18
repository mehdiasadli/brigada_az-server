import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IncomingQueryParams,
  queryHandler,
  queryParser,
} from 'src/lib/utils/queryParser';
import { Followship } from '@prisma/client';
import { publicUserForPost } from 'src/lib/utils/publicUser';
import { getPaginationInfo } from 'src/lib/utils/getPaginationInfo';

@Injectable()
export class FollowshipService {
  constructor(private readonly prisma: PrismaService) {}

  private async createFollow(followingId: string, currentUserId: string) {
    return await this.prisma.followship.create({
      data: {
        followerId: currentUserId,
        followingId,
      },
      include: {
        follower: {
          select: {
            username: true,
          },
        },
        following: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  private async removeFollow(id: string) {
    return await this.prisma.followship.delete({
      where: {
        id,
      },
      include: {
        follower: {
          select: {
            username: true,
          },
        },
        following: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  private async getFollowByUsers(followingId: string, currentUserId: string) {
    return await this.prisma.followship.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId,
        },
      },
    });
  }

  async follow(followingId: string, currentUserId: string) {
    const existing = await this.getFollowByUsers(followingId, currentUserId);

    if (!existing) {
      return await this.createFollow(followingId, currentUserId);
    }

    return await this.removeFollow(existing.id);
  }

  async getFollowersOfUser(userId: string, query?: IncomingQueryParams) {
    const { where, orderBy, pagination } = queryHandler(
      queryParser<Followship>(query),
    );

    const follows = await this.prisma.followship.findMany({
      where: {
        followingId: userId,
        ...where,
      },
      orderBy,
      ...(pagination ? { take: pagination.limit, skip: pagination.skip } : {}),
      include: {
        follower: {
          select: publicUserForPost,
        },
      },
    });

    if (pagination === undefined) {
      return follows;
    }

    const total = await this.prisma.followship.count({
      where: {
        followingId: userId,
        ...where,
      },
      orderBy,
    });

    return {
      meta: getPaginationInfo(
        total,
        follows,
        pagination.page,
        pagination.limit,
      ),
      data: follows,
    };
  }

  async getFollowingOfUser(userId: string, query?: IncomingQueryParams) {
    const { where, orderBy, pagination } = queryHandler(
      queryParser<Followship>(query),
    );

    const follows = await this.prisma.followship.findMany({
      where: {
        followerId: userId,
        ...where,
      },
      orderBy,
      ...(pagination ? { take: pagination.limit, skip: pagination.skip } : {}),
      include: {
        following: {
          select: publicUserForPost,
        },
      },
    });

    if (pagination === undefined) {
      return follows;
    }

    const total = await this.prisma.followship.count({
      where: {
        followerId: userId,
        ...where,
      },
      orderBy,
    });

    return {
      meta: getPaginationInfo(
        total,
        follows,
        pagination.page,
        pagination.limit,
      ),
      data: follows,
    };
  }
}
