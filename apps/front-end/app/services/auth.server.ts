// app/services/auth.server.ts
import {
  DeviceTokenResponseDto,
  TokenResponseDto,
} from '@overtheairbrew/models';
import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { login } from '../fetch';
import { sessionStorage } from './session.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<
  TokenResponseDto | DeviceTokenResponseDto | Error | null
>(sessionStorage, {
  sessionKey: 'sessionKey',
  sessionErrorKey: 'sessionErrorKey',
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get('email');
    const password = form.get('password');

    if (!email) throw new AuthorizationError('Email is required');
    if (!password) throw new AuthorizationError('Password is required');

    const user = await login(email!.toString(), password!.toString());

    console.log('user', user);

    return user;
  }),
  'user-pass'
);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const token = form.get('token');
    if (!token) throw new AuthorizationError('Token is required');
    return {
      token: token.toString(),
    };
  }),
  'display'
);
