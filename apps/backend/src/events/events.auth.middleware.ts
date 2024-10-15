import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ApiKeyService } from '../services/api-key.service';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const AuthMiddleware = (
  jwtService: JwtService,
  apiKeyService: ApiKeyService,
): SocketMiddleware => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    const [type, token] = socket.handshake?.auth?.token?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : undefined;

    const apiKey = socket.handshake?.query?.apiKey;

    try {
      if (
        (!accessToken || typeof accessToken === 'undefined') &&
        (!apiKey || typeof apiKey === 'undefined')
      )
        throw new WsException('Api Key or Token not provided');

      if (apiKey) {
        await apiKeyService.validateApiKey(apiKey as string);
      } else {
        await jwtService.verifyAsync(accessToken as string);
      }

      next();
    } catch (err) {
      next(new Error('UNAUTHORIZED'));
    }
  };
};
