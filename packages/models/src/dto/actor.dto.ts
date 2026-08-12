import { createZodDto } from 'nestjs-zod';
import { ActorSchema } from '../schema/actor.schema.ts';

export class ActorDto extends createZodDto(ActorSchema) {}
