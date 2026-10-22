import { join } from 'path';

export const credentialsFile =
  process.env.CREDENTIALS_FILE ||
  join(__dirname, '..', '..', 'credentials.json');
