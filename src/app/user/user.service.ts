import {
  BadRequestException,
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
import { TChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadAvatar(file: Express.Multer.File, currentUserId: string) {
    const user = await this.findById(currentUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar && user.avatar_id) {
      await this.deleteAvatar(user.avatar_id);
    }

    const result = await this.cloudinaryService.uploadImage(file);

    const updated = await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        avatar: result.secure_url,
        avatar_id: result.public_id,
      },
    });

    return this.json(updated);
  }

  async deleteAvatar(currentUserId: string) {
    const user = await this.findById(currentUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar === null || user.avatar_id === null) {
      return this.json(user);
    }

    const [, updated] = await Promise.all([
      await this.cloudinaryService.deleteImage(user.avatar_id),
      await this.prisma.user.update({
        where: {
          id: currentUserId,
        },
        data: {
          avatar: null,
          avatar_id: null,
        },
      }),
    ]);

    return this.json(updated);
  }

  async search(
    query?: string,
    options: { take?: number; select?: any; fields?: (keyof User)[] } = {},
  ) {
    if (!query) return [];
    const {
      take = 5,
      select = publicUserForPost,
      fields = ['username', 'first_name', 'last_name'],
    } = options;

    return await this.prisma.user.findMany({
      where: {
        OR: fields.map((field) => ({
          [field]: { contains: query as any, mode: 'insensitive' },
        })),
      },
      select,
      take,
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
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async findById(id?: string) {
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
      bio: user.bio,
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

  async changePassword(
    currentUserId: string,
    changePasswordDto: TChangePasswordDto,
  ) {
    const user = await this.findById(currentUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(changePasswordDto.password, user.password))) {
      throw new BadRequestException('Invalid password');
    }

    const updated = await this.prisma.user.update({
      where: { id: currentUserId },
      data: {
        password: await this.hash(changePasswordDto.new_password),
      },
    });

    return this.json(updated);
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
