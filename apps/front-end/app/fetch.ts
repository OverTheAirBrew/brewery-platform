import { TokenResponseDto } from '@overtheairbrew/models';
import { configureRefreshFetch, fetchJSON } from 'refresh-fetch';
import { authenticator } from './services/auth.server';
import { destroySession, getSession } from './services/session.server';

export const retrieveToken = async (request: Request) => {
  const user = await authenticator.isAuthenticated(request);
  return user!.token;
};

// const saveToken = async (request: Request, token:string, refreshToken:string) => {
//   const session = await getSession(request.headers.get('Cookie'));
//   session.set('token', token);
//   session.set('refreshToken', refreshToken);
//   return session;
// }

const clearToken = async (request: Request) => {
  const session = await getSession(request.headers.get('Cookie'));
  destroySession(session);
};

type FetchOptions<TBody> = {
  headers?: Record<string, string>;
  method: string;
  body?: TBody;
};

const fetchJSONWithToken = <TResponse, TBody>(request: Request) => {
  return async (
    url: string,
    options: FetchOptions<TBody> = { method: 'GET' },
  ) => {
    const token = await retrieveToken(request);

    let optionsWithToken: RequestInit = {
      ...options,
      body: JSON.stringify(options.body),
    };

    if (token != null) {
      optionsWithToken = {
        ...options,
        body: JSON.stringify(options.body),
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return fetchJSON<TResponse>(url, optionsWithToken);
  };
};

export const login = async (email: string, password: string) => {
  const response = await fetchJSON<TokenResponseDto>(
    `${process.env.API_BASE_URL}/users/login`,
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  return response.body;
};

const logout = async (request: Request) => {
  await fetchJSONWithToken(request)('/api/auth/logout', {
    method: 'POST',
  });

  await clearToken(request);
};

const shouldRefreshToken = (error: {
  response: { status: number };
  body: { message: string };
}) =>
  error.response?.status === 401 && error.body.message === 'Token has expired';

const refreshToken = (request: Request) => {
  return async () => {
    try {
      const response = await fetchJSONWithToken<
        { token: string; refreshToken: string },
        {}
      >(request)('/api/auth/refresh-token', {
        method: 'POST',
      });

      // saveToken(request, response.body.token, response.body.refreshToken)
    } catch (err) {
      clearToken(request);
      throw err;
    }
  };
};

export const fetch = <TResponse>(request: Request) =>
  configureRefreshFetch({
    fetch: fetchJSONWithToken<TResponse, any>(request),
    shouldRefreshToken,
    refreshToken: refreshToken(request),
  });

export const fetchNoToken = <TResponse, TBody>(
  url: string,
  options: FetchOptions<TBody>,
) => {
  return fetchJSON<TResponse>(url, {
    ...options,
    body: JSON.stringify(options.body),
  });
};
