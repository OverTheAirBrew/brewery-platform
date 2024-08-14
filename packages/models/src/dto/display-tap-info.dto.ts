import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { DisplayTapInformationSchema } from '../schema/display-tap-info.schema';

export class DisplayTapInformationDto extends createZodDto(
  DisplayTapInformationSchema,
) {}
