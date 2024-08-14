import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket';
import { Public } from '../auth/public.decorator';

interface IWebsocketMessage<Data> {
  Topic: string;
  message: Data;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: string[] = [];
  private readonly ROOM_NAME = 'brewery';

  constructor(private readonly jwtService: JwtService) {}

  @Public()
  @SubscribeMessage('TapConfigured')
  public handleAllMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    console.log('I GOT SOME DATA');

    this.server.emit('TapConfigured', data);
  }

  public sendMessage<Data>(message: IWebsocketMessage<Data>) {
    this.server.emit(message.Topic, message.message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server): void {
    // console.log('Init');
  }

  async handleDisconnect(client: Socket) {
    const user = await this.getUser(client);

    const userPos = this.connectedUsers.indexOf(String(user.sub));

    if (userPos > -1) {
      this.connectedUsers = [
        ...this.connectedUsers.slice(0, userPos),
        ...this.connectedUsers.slice(userPos + 1),
      ];
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleConnection(client: Socket, ...args: any[]) {
    const user = await this.getUser(client);

    this.connectedUsers.push(user.sub);

    // client.join(this.ROOM_NAME);
    return;
  }

  private async getUser(client: Socket) {
    const accessToken = this.extractTokenFromHeader(client.handshake);

    if (!accessToken || typeof accessToken === 'undefined') {
      throw new WsException('No authorization header');
    }

    try {
      return await this.jwtService.verifyAsync(accessToken);
    } catch (err) {
      throw new WsException(err);
    }
  }

  private extractTokenFromHeader(request: Handshake): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
