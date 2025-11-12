import { Controller, Get } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('/health')
export class HealthController {
  @Get()
  @Public()
  checkHealth() {
    return { status: 'ok' };
  }
}
