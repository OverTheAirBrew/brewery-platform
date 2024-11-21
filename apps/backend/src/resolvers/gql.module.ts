import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { REPOSITORIES } from '../data/data.abstractions';
import { Beverage } from '../data/entities/beverage.entity';
import { Image } from '../data/entities/image.entity';
import { Keg } from '../data/entities/keg.entity';
import { BeveragesService } from '../services/beverages.service';
import { KegsService } from '../services/kegs.service';
import { BeverageResolver, KegsResolver } from './kegs.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
  ],
  providers: [
    KegsResolver,
    BeverageResolver,
    KegsService,
    BeveragesService,
    {
      provide: REPOSITORIES.KegRepository,
      useValue: Keg,
    },
    {
      provide: REPOSITORIES.BeverageRepository,
      useValue: Beverage,
    },
    {
      provide: REPOSITORIES.ImageRepository,
      useValue: Image,
    },
  ],
})
export class GqlModule {}
