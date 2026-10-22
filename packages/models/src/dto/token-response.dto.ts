import { createZodDto } from 'nestjs-zod';
import { TokenResponse } from '../schema';

export class TokenResponseDto extends createZodDto(TokenResponse) {}
