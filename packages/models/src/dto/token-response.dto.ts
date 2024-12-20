import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { DeviceTokenResponse, TokenResponse } from '../schema';

export class TokenResponseDto extends createZodDto(TokenResponse) {}
export class DeviceTokenResponseDto extends createZodDto(DeviceTokenResponse) {}
