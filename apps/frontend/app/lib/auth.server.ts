import { createCookieSessionStorage, redirect } from 'react-router';

export interface AuthUser {
  name: string;
  email: string;
}

const USER_SESSION_KEY = 'user';

const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__otab_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.SESSION_SECRET ?? 'dev-session-secret-change-me'],
    maxAge: 60 * 60 * 24 * 7,
  },
});

async function getSession(request: Request) {
  return authSessionStorage.getSession(request.headers.get('Cookie'));
}

export async function getOptionalUser(request: Request) {
  const session = await getSession(request);
  const user = session.get(USER_SESSION_KEY) as AuthUser | undefined;
  return user ?? null;
}

export async function requireUser(request: Request, redirectTo?: string) {
  const user = await getOptionalUser(request);
  if (user) {
    return user;
  }

  const url = new URL(request.url);
  const next = redirectTo ?? `${url.pathname}${url.search}`;
  throw redirect(`/login?redirectTo=${encodeURIComponent(next)}`);
}

export async function createUserSession(user: AuthUser, redirectTo = '/') {
  const session = await authSessionStorage.getSession();
  session.set(USER_SESSION_KEY, user);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await authSessionStorage.commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request) {
  const session = await getSession(request);

  return redirect('/login', {
    headers: {
      'Set-Cookie': await authSessionStorage.destroySession(session),
    },
  });
}
