import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TCreateUserDto } from './dto/create-user.dto';
import { TUpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/app/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { publicUserForPost } from 'src/lib/utils/publicUser';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query?: string) {
    if (!query) return [];

    return await this.prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query as any,
              mode: 'insensitive',
            },
          },
          {
            first_name: {
              contains: query as any,
              mode: 'insensitive',
            },
          },
          {
            last_name: {
              contains: query as any,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: publicUserForPost,
      take: 8,
    });
  }

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        followed_by: {
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            posts: true,
            followed_by: true,
            following: true,
            events: true,
            polls: true,
            games: true,
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  private async hash(password: string, rounds = 10) {
    return await bcrypt.hash(password, rounds);
  }

  json(user: User) {
    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      roles: user.roles,
      created_at: user.created_at,
      email: user.email,
      date_of_birth: user.date_of_birth,
      positions: user.positions,
    };
  }

  async create(createUserDto: TCreateUserDto) {
    if (await this.findByEmail(createUserDto.email)) {
      throw new ConflictException('Email already in use');
    }

    if (await this.findByEmail(createUserDto.username)) {
      throw new ConflictException('Username already in use');
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: await this.hash(createUserDto.password),
      },
    });

    return this.json(user);
  }

  async update(id: string, updateUserDto: TUpdateUserDto) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      if (
        (await this.findByEmail(updateUserDto.email)) &&
        updateUserDto.email !== user.email
      ) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.json(updated);
  }

  async remove(id: string) {
    await this.prisma.user
      .delete({
        where: {
          id,
        },
      })
      .catch(() => {
        throw new NotFoundException('User not found when deleting');
      });
  }
}
