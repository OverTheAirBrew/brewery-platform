import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { DisplayLoginSchema } from '../schema/display-login.schema';

export class DisplayLoginDto extends createZodDto(DisplayLoginSchema) {}
