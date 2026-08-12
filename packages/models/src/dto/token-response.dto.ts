import { createZodDto } from 'nestjs-zod';
import { TokenResponse } from '../schema/index.ts';

export class TokenResponseDto extends createZodDto(TokenResponse) {}
