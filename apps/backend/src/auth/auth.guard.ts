import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ApiKeyService } from '../services/api-key.service';
import { ALLOW_API_KEY } from './api-key.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private apiKeyService: ApiKeyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const useApiKey = this.reflector.getAllAndOverride<boolean>(ALLOW_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    if (useApiKey) {
      const apiKey = this.extractApiKeyFromHeaderOrQuery(request);
      if (apiKey) {
        const apiKeyValid = await this.apiKeyService.validateApiKey(apiKey);
        if (apiKeyValid) return true;
      }

      throw new UnauthorizedException();
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token!);
      request['user'] = payload;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }

  private extractApiKeyFromHeaderOrQuery(request: Request): string | undefined {
    return (
      request.headers['x-api-key']?.toString() ||
      request.query['api-key']?.toString()
    );
  }
}
