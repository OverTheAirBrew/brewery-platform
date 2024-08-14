import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { UserSchema } from '../schema';

export class UserDto extends createZodDto(UserSchema) {}
