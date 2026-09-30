import { applyDecorators } from '@nestjs/common';
import { MessagePattern as NestMessagePattern } from '@nestjs/microservices';

export const MessagePattern = (pattern: string) => {
  console.log(
    `Creating message pattern for: ${pattern}, prefix: ${process.env.MQTT_PREFIX}`,
  );

  const prefix = process.env.MQTT_PREFIX;

  const messageDecorator = prefix
    ? NestMessagePattern(`${pattern}/${prefix}`)
    : NestMessagePattern(pattern);

  return applyDecorators(messageDecorator);
};
