import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, TCreateUserDto } from './dto/create-user.dto';
import { TUpdateUserDto, UpdateUserDto } from './dto/update-user.dto';
import { Zod } from 'src/lib/pipes/zod.pipe';
import { Auth } from 'src/lib/decorators/auth.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body(Zod.create(CreateUserDto)) createUserDto: TCreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Put(':id')
  @Auth()
  async update(
    @Param('id') id: string,
    @Body(Zod.create(UpdateUserDto)) updateUserDto: TUpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth()
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
