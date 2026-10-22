import { Controller, Get } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';

/* istanbul ignore start */
@ApiTags('health')
@Controller('/health')
export class HealthController {
  /* istanbul ignore stop */
  @Get()
  @Public()
  checkHealth() {
    return { status: 'ok' };
  }
}
