import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { TokenResponse } from '../schema';

export class TokenResponseDto extends createZodDto(TokenResponse) {}
