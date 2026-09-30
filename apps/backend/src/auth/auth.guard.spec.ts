import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  Mocked,
  vi,
} from 'vitest';
import { AuthGuard } from './auth.guard';
import { TestBed } from '@suites/unit';
import { Reflector } from '@nestjs/core';
import { getHashes } from 'crypto';
import { ApiKey } from '../data/entities/api-key.entity';
import { ApiKeysService } from '../api/api-keys/api-keys.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  let reflector: Mocked<Reflector>;
  let apiKeyService: Mocked<ApiKeysService>;
  let jwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthGuard).compile();
    authGuard = unit;
    reflector = unitRef.get(Reflector);
    apiKeyService = unitRef.get(ApiKeysService);
    jwtService = unitRef.get(JwtService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('IS_PUBLIC', () => {
    it('should return true if the endpoint is public', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = await authGuard.canActivate({
        getHandler: () => ({}),
        getClass: () => ({}),
      } as any);

      expect(result).toBe(true);
    });
  });

  describe('API_KEY', () => {
    it.each([
      { headers: { 'x-api-key': 'testing' } },
      { query: { 'api-key': 'testing' } },
    ])(
      'should validate with an api key from a header or query parameter',
      async ({ headers, query }) => {
        reflector.getAllAndOverride.mockReturnValueOnce(false);
        reflector.getAllAndOverride.mockReturnValueOnce(true);

        apiKeyService.validateApiKey.mockResolvedValueOnce(true);

        const result = await authGuard.canActivate({
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: vi.fn().mockReturnValue({
            getRequest: vi.fn().mockReturnValue({
              headers: headers || {},
              query: query || {},
            }),
          }),
        } as any);

        expect(result).toBe(true);
      },
    );

    it('should throw an UnauthorizedException if the api key is invalid', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false);
      reflector.getAllAndOverride.mockReturnValueOnce(true);

      apiKeyService.validateApiKey.mockResolvedValueOnce(false);

      await expect(
        authGuard.canActivate({
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: vi.fn().mockReturnValue({
            getRequest: vi.fn().mockReturnValue({
              headers: {
                'x-api-key': 'invalid',
              },
            }),
          }),
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw an UnauthorizedException if no api key is provided', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false);
      reflector.getAllAndOverride.mockReturnValueOnce(true);

      await expect(
        authGuard.canActivate({
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: vi.fn().mockReturnValue({
            getRequest: vi.fn().mockReturnValue({
              headers: { 'x-api-key': undefined },
              query: {},
            }),
          }),
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('JWT', () => {
    it('should throw an UnauthorizedException if the token is invalid', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false);
      reflector.getAllAndOverride.mockReturnValueOnce(false);

      await expect(
        authGuard.canActivate({
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: vi.fn().mockReturnValue({
            getRequest: vi.fn().mockReturnValue({
              headers: {},
            }),
          }),
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should return true if the token is valid', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false);
      reflector.getAllAndOverride.mockReturnValueOnce(false);

      jwtService.verifyAsync.mockResolvedValueOnce({});

      const result = await authGuard.canActivate({
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: vi.fn().mockReturnValue({
          getRequest: vi.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
      } as any);

      expect(result).toBe(true);
    });

    it('should throw an UnauthorizedException if no token is provided', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false);
      reflector.getAllAndOverride.mockReturnValueOnce(false);

      await expect(
        authGuard.canActivate({
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: vi.fn().mockReturnValue({
            getRequest: vi.fn().mockReturnValue({
              headers: {},
            }),
          }),
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw an UnauthorizedException if the token fails to verify', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false);
      reflector.getAllAndOverride.mockReturnValueOnce(false);

      jwtService.verifyAsync.mockRejectedValueOnce(new Error('Token expired'));

      await expect(
        authGuard.canActivate({
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: vi.fn().mockReturnValue({
            getRequest: vi.fn().mockReturnValue({
              headers: {
                authorization: 'Bearer expired-token',
              },
            }),
          }),
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
