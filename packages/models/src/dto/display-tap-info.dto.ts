import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import {
  DisplayTapInformationSchema,
  DisplayTapInformationUnauthenticatedSchema,
} from '../schema/display-tap-info.schema';

export class DisplayTapInformationUnauthenticatedDto extends createZodDto(
  DisplayTapInformationUnauthenticatedSchema,
) {}

export class DisplayTapInformationDto extends createZodDto(
  DisplayTapInformationSchema,
) {}
