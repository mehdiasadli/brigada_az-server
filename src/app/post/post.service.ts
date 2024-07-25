import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { MentionService } from '../mention/mention.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private mentionService: MentionService,
  ) {}

  async getPostById(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: publicUserForPost,
        },
        mentions: {
          include: {
            mentioned: {
              select: {
                username: true,
                id: true,
              },
            },
          },
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

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
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
        mentions: {
          include: {
            mentioned: {
              select: {
                username: true,
                id: true,
              },
            },
          },
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
        mentions: {
          include: {
            mentioned: {
              select: {
                username: true,
                id: true,
              },
            },
          },
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
    const { mentions, ...rest } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        ...rest,
        authorId: currentUserId,
      },
    });

    await this.mentionService.addMentions(post, mentions);

    return post;
  }

  async delete(postId: string) {
    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }
}
