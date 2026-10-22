import { createZodDto } from 'nestjs-zod';
import { UserSchema } from '../schema';

export class UserDto extends createZodDto(UserSchema) {}
