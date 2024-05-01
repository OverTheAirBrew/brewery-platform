import { createZodDto } from '@wahyubucil/nestjs-zod-openapi';
import { KegSchema } from '../schema/keg.schema';

export class KegDto extends createZodDto(KegSchema) {}
