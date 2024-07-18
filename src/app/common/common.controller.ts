import { Controller, Get, Query } from '@nestjs/common';
import { CommonService } from './common.service';
import { Auth } from 'src/lib/decorators/auth.decorator';

@Controller('common')
export class CommonController {
  constructor(private commonService: CommonService) {}

  @Auth()
  @Get('search')
  async search(@Query('query') query?: string) {
    return await this.commonService.search(query);
  }
}
