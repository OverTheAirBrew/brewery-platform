import { registerAs } from '@nestjs/config';
import { homedir } from 'os';

export interface IGlobalConfig {
  dataDirectory: string;
  uploadDirectory: string;
}

export const GlobalConfig = () => ({
  dataDirectory:
    process.env.DATA_DIR || `${homedir()}/brewery-management-platform`,
  uploadDirectory:
    process.env.UPLOAD_DIR || `${homedir()}/brewery-management-platform/upload`,
});

export default registerAs<IGlobalConfig>('GLOBAL', () => GlobalConfig());
