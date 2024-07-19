import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TCreatePostDto } from './dto/create-post.dto';
import {
  IncomingQueryParams,
  queryHandler,
  queryParser,
} from 'src/lib/utils/queryParser';
import { Post } from '@prisma/client';
import { getPaginationInfo } from 'src/lib/utils/getPaginationInfo';
import { publicUserForPost } from 'src/lib/utils/publicUser';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async getPostById(postId: string) {
    return await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: publicUserForPost,
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: publicUserForPost,
            },
          },
        },
      },
    });
  }

  async getUsersPosts(authorId: string, query?: IncomingQueryParams) {
    const { where, orderBy, pagination } = queryHandler(
      queryParser<Post>(query),
    );

    const posts = await this.prisma.post.findMany({
      where: {
        authorId,
        ...where,
      },
      orderBy,
      ...(pagination ? { take: pagination.limit, skip: pagination.skip } : {}),
      include: {
        author: {
          select: publicUserForPost,
        },
        comments: {
          select: {
            id: true,
          },
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (pagination === undefined) {
      return posts;
    }

    const total = await this.prisma.post.count({
      where: {
        authorId,
        ...where,
      },
      orderBy,
    });

    return {
      meta: getPaginationInfo(total, posts, pagination.page, pagination.limit),
      data: posts,
    };
  }

  async feed(currentUserId: string, query?: IncomingQueryParams) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
      include: {
        following: {
          select: {
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const included = user.following.map((following) => following.following.id);

    const { where, orderBy, pagination } = queryHandler(
      queryParser<Post>(query),
    );

    const posts = await this.prisma.post.findMany({
      where: {
        ...where,
        authorId: {
          in: [...included, user.id],
        },
      },
      orderBy,
      ...(pagination ? { take: pagination.limit, skip: pagination.skip } : {}),
      include: {
        author: {
          select: publicUserForPost,
        },
        comments: {
          select: {
            id: true,
          },
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (pagination === undefined) {
      return posts;
    }

    const total = await this.prisma.post.count({
      where: {
        ...where,
        authorId: {
          in: [...included, user.id],
        },
      },
    });

    return {
      meta: getPaginationInfo(total, posts, pagination.page, pagination.limit),
      data: posts,
    };
  }

  async create(createPostDto: TCreatePostDto, currentUserId: string) {
    return await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: currentUserId,
      },
    });
  }

  async delete(postId: string) {
    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }
}
