import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

const TYPES = {
  USER: 'USER',
  POST: 'POST',
} as const;

@Injectable()
export class CommonService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async search(query?: string) {
    if (!query) return [];

    const users = (await this.userService.search(query)).map((user) => ({
      ...user,
      type: TYPES.USER,
    }));

    const posts = (
      await this.prisma.post.findMany({
        where: {
          OR: [
            {
              content: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: 5,
        include: {
          author: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      })
    ).map((post) => ({ ...post, type: TYPES.POST }));

    return [...users, ...posts].sort(() => (Math.random() > 0.5 ? 1 : -1));
  }
}
