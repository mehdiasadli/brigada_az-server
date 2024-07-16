import { BadRequestException, Injectable } from '@nestjs/common';
import { TLoginDto } from './dto/login.dto';
import { UserService } from 'src/app/user/user.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  private generateToken(id: string) {
    return jwt.sign({ id }, process.env.JWT_SECRET!);
  }

  private getUser(user: User) {
    return {
      ...this.userService.json(user),
      token: this.generateToken(user.id),
    };
  }

  async login(loginDto: TLoginDto) {
    const user = await this.userService.findByUsername(loginDto.username);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.getUser(user);
  }
}
