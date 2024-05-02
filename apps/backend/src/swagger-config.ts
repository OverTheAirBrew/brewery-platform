import { DocumentBuilder } from "@nestjs/swagger";

const VERSION = process.env.VERSION || 'dev';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Over The Air Brew Brewing Platform')
    .setVersion(VERSION);