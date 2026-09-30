import { applyDecorators } from '@nestjs/common';
import { MessagePattern as NestMessagePattern } from '@nestjs/microservices';

export const MessagePattern = (pattern: string) => {
  const messageDecorator = process.env.MQTT_PREFIX
    ? NestMessagePattern(`${process.env.MQTT_PREFIX}/${pattern}`)
    : NestMessagePattern(pattern);

  return applyDecorators(messageDecorator);
};
