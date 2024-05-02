import { getServerSession } from 'next-auth';
import { DeviceTypesApi, UsersApi } from '@overtheairbrew/api-client';
import { authOptions } from './auth-options';

const defaultOptions = {
  basePath: 'http://localhost:3001',
  isJsonMime: () => true,
  accessToken: async () => {
    const session = await getServerSession(authOptions);

    if (session) {
      return session.accessToken;
    }

    return '';
  },
};

export const deviceTypesClient = new DeviceTypesApi({
  ...defaultOptions,
});

export const usersClient = new UsersApi({
  ...defaultOptions,
});
