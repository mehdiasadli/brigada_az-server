import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, TCreateUserDto } from './dto/create-user.dto';
import { TUpdateUserDto, UpdateUserDto } from './dto/update-user.dto';
import { Zod } from 'src/lib/pipes/zod.pipe';
import { Auth } from 'src/lib/decorators/auth.decorator';
import {
  ChangePasswordDto,
  TChangePasswordDto,
} from './dto/change-password.dto';
import { UserId } from 'src/lib/decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body(Zod.create(CreateUserDto)) createUserDto: TCreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Auth()
  @Get('search')
  async search(@Query('query') query?: string) {
    return await this.userService.search(query);
  }

  @Auth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Auth()
  @Get('profile/:username')
  async getProfile(@Param('username') username: string) {
    return await this.userService.getProfile(username);
  }

  @Auth()
  @Put('passwords')
  async changePassword(
    @Body(Zod.create(ChangePasswordDto)) changePasswordDto: TChangePasswordDto,
    @UserId() currentUserId: string,
  ) {
    return await this.userService.changePassword(
      currentUserId,
      changePasswordDto,
    );
  }

  @Auth()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(Zod.create(UpdateUserDto)) updateUserDto: TUpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Auth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
