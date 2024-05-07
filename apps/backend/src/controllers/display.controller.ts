import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('displays')
@Controller('/displays')
export class DisplaysController {
  @Get('/')
  async get() {
    return {
      hello: 'world',
    };
  }
}
