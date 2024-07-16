import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Zod } from 'src/lib/pipes/zod.pipe';
import { LoginDto, TLoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body(Zod.create(LoginDto)) body: TLoginDto) {
    return await this.authService.login(body);
  }
}
