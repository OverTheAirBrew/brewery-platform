import { createZodDto } from 'nestjs-zod';
import { UserSchema } from '../schema/index.ts';

export class UserDto extends createZodDto(UserSchema) {}
