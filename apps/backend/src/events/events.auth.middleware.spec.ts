import { AuthMiddleware, SocketMiddleware } from './events.auth.middleware';

describe('EventsAuthMiddleware', () => {
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockApiKeyService = {
    validateApiKey: jest.fn(),
  };

  const mockNext = jest.fn();

  let middleware: SocketMiddleware;

  beforeEach(() => {
    middleware = AuthMiddleware(
      mockJwtService as any,
      mockApiKeyService as any,
    );

    mockJwtService.verifyAsync.mockResolvedValue({ id: 'id' });
    mockApiKeyService.validateApiKey.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should validate an api key', async () => {
    await middleware(
      {
        handshake: {
          query: {
            apiKey: 'testing',
          },
        },
      } as any,
      mockNext,
    );

    expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith('testing');
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();

    expect(mockNext).toHaveBeenCalled();
  });

  it('should validate a token', async () => {
    await middleware(
      {
        handshake: {
          auth: {
            token: 'Bearer token',
          },
        },
      } as any,
      mockNext,
    );

    expect(mockApiKeyService.validateApiKey).not.toHaveBeenCalled();
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('token');

    expect(mockNext).toHaveBeenCalled();
  });

  it('should error if no token or api key is provided', async () => {
    await middleware(
      {
        handshake: {
          auth: {},
        },
        query: {},
      } as any,
      mockNext,
    );

    expect(mockApiKeyService.validateApiKey).not.toHaveBeenCalled();
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();

    expect(mockNext).toHaveBeenCalledWith(new Error('UNAUTHORIZED'));
  });
});
