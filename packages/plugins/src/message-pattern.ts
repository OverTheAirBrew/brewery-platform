import { applyDecorators } from '@nestjs/common';
import { MessagePattern as NestMessagePattern } from '@nestjs/microservices';

export const MessagePattern = (pattern: string) => {
  console.log(
    `Creating message pattern for: ${pattern}, postfix: ${process.env.MQTT_POSTFIX}`,
  );

  const postfix = process.env.MQTT_POSTFIX;

  const messageDecorator = postfix
    ? NestMessagePattern(`${pattern}/${postfix}`)
    : NestMessagePattern(pattern);

  return applyDecorators(messageDecorator);
};
