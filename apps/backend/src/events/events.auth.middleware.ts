import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { KeysService } from '../api/keys/keys.service';

export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => Promise<void>;

export const AuthMiddleware = (
  jwtService: JwtService,
  keysService: KeysService,
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
        await keysService.validateApiKey(apiKey as string);
      } else {
        await jwtService.verifyAsync(accessToken as string);
      }

      next();
    } catch (err) {
      next(new Error('UNAUTHORIZED'));
    }
  };
};
