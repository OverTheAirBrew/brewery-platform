import { createZodDto } from 'nestjs-zod';
import { DisplayTapInformationSchema } from '../schema/display-tap-info.schema';

export class DisplayTapInformationDto extends createZodDto(
  DisplayTapInformationSchema,
) {}
