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

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
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
    if (updateUserDto.email) {
      if (await this.findByEmail(updateUserDto.email)) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.json(user);
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
