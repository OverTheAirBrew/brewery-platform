import { homedir } from 'os';
import z from 'zod';

export const ConfigSchema = z.object({
  DATA_DIRECTORY: z
    .string()
    .default(`${homedir()}/brewery-management-platform`),
  UPLOAD_DIRECTORY: z
    .string()
    .default(`${homedir()}/brewery-management-platform/upload`),
});
