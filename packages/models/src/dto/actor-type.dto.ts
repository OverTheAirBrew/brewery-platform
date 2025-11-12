import { createZodDto } from 'nestjs-zod';
import { ActorTypeSchema } from '../schema/actor-type.schema.ts';

export class ActorTypeDto extends createZodDto(ActorTypeSchema) {}
