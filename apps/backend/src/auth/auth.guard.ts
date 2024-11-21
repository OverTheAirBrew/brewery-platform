import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IMessage } from '../sse/sse.service';
import {
  DISPLAY_ALLOWED_KEY,
  DISPLAY_SSE_MESSAGES,
  IS_PUBLIC_KEY,
  PUBLIC_SSE_MESSAGES,
} from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  private isPublic(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
  }

  private async isTokenAuth(context: ExecutionContext, request: Request) {
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      return this.jwtService.verify<{ scopes: string[] }>(token!);
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
  }

  private hasRequiredScopes(context: ExecutionContext, scopes: string[]) {
    const displayAllowed = this.reflector.getAllAndOverride<boolean>(
      DISPLAY_ALLOWED_KEY,
      [context.getHandler(), context.getClass()],
    );

    const allowedScopes = ['user'];
    if (displayAllowed) allowedScopes.push('tap-display');

    return allowedScopes.some((scope) => scopes.includes(scope));
  }

  private isSsePublic(context: ExecutionContext, request: Request) {
    const publicSseMessages = this.reflector.getAllAndOverride<IMessage<any>[]>(
      PUBLIC_SSE_MESSAGES,
      [context.getHandler(), context.getClass()],
    );

    if (!publicSseMessages) return false;

    const topic = request.params.topic;

    if (publicSseMessages.some((message) => message.Topic === topic))
      return true;

    return false;
  }

  private isDeviceAllowedSseEvents(
    context: ExecutionContext,
    request: Request,
    scopes: string[],
  ) {
    const displaySseMessages = this.reflector.getAllAndOverride<
      IMessage<any>[]
    >(DISPLAY_SSE_MESSAGES, [context.getHandler(), context.getClass()]);

    const topic = request.params.topic;

    if (displaySseMessages?.some((message) => message.Topic === topic)) {
      return scopes.includes('user') || scopes.includes('tap-display');
    }

    return scopes.includes('user');
  }

  async canActivate(
    context: ExecutionContext | GraphQLExecutionContext,
  ): Promise<boolean> {
    let request: any;

    if (context.getType().toString() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    if (this.isPublic(context)) return true;
    if (this.isSsePublic(context, request)) return true;

    const token = await this.isTokenAuth(context, request);

    if (this.isDeviceAllowedSseEvents(context, request, token.scopes))
      return true;

    if (this.hasRequiredScopes(context, token.scopes)) return true;

    return false;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type == 'Bearer') {
      return token;
    }

    const tokenQuery = request.query.token?.toString();
    return tokenQuery ?? undefined;
  }
}
