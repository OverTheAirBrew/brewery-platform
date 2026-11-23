import { createZodDto } from 'nestjs-zod';
import {
  SingleUseCodeExchangeResponse,
  SingleUseCodeExchangeSchema,
} from '../schema/single-use-code-exchange.schema.ts';

export class SingleUseCodeExchangeDto extends createZodDto(
  SingleUseCodeExchangeSchema,
) {}

export class SingleUseCodeExchangeResponseDto extends createZodDto(
  SingleUseCodeExchangeResponse,
) {}
