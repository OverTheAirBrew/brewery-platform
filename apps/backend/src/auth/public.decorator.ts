import { SetMetadata } from '@nestjs/common';
import { IMessage } from '../sse/sse.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const PUBLIC_SSE_MESSAGES = 'isPublicMessages';
export const DISPLAY_SSE_MESSAGES = 'isDisplayMessages';
export const DISPLAY_ALLOWED_KEY = 'displayAllowed';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const SsePublic = <TData>(
  ...messages: IMessage<TData>[]
): ClassDecorator => {
  return SetMetadata(PUBLIC_SSE_MESSAGES, messages);
};

export const SseDisplay = <TData>(
  ...messages: IMessage<TData>[]
): ClassDecorator => SetMetadata(DISPLAY_SSE_MESSAGES, messages);

export const DisplayAllowed = () => SetMetadata(DISPLAY_ALLOWED_KEY, true);
