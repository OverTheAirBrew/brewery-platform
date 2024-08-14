import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { ApiKeyService } from '../services/api-key.service';
import { AuthMiddleware } from './events.auth.middleware';

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
    private readonly apiKeyService: ApiKeyService,
  ) {}

  public sendMessage<Data>(contract: IWebsocketMessage<Data>) {
    return async (message: Data) => {
      this.server.emit(contract.Topic, JSON.stringify(message));
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server): void {
    server.use(AuthMiddleware(this.jwtService, this.apiKeyService));
  }
}
