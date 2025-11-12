import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { AuthMiddleware } from './events.auth.middleware';
import { ApiKeysService } from '../api/api-keys/api-keys.service';

interface IWebsocketMessage<Data> {
  Topic: string;
  Message: Data;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  public sendMessage<Data>(contract: IWebsocketMessage<Data>) {
    return async (message: Data) => {
      this.server.emit(contract.Topic, JSON.stringify(message));
    };
  }

  afterInit(server: Server): void {
    server.use(AuthMiddleware(this.jwtService, this.apiKeysService));
  }
}
