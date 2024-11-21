import { Controller, Param, Sse } from '@nestjs/common';
import {
  DisplayUpdatedMessage,
  LoginCallback,
} from '@overtheairbrew/socket-events';
import { SseDisplay, SsePublic } from '../auth/public.decorator';
import { SseService } from '../sse/sse.service';

@Controller('sse')
@SsePublic(LoginCallback)
@SseDisplay(DisplayUpdatedMessage)
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('/:topic')
  sse(@Param('topic') topic: string) {
    return this.sseService.subscribe(topic);
  }

  @Sse('/:topic/:id')
  sseById(@Param('topic') topic: string, @Param('id') id: string) {
    return this.sseService.subscribeForId(topic, id);
  }
}
