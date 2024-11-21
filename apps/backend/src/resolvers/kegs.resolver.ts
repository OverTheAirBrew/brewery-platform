import {
  Field,
  ID,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { BeveragesService } from '../services/beverages.service';
import { KegsService } from '../services/kegs.service';

@ObjectType({ description: 'beverage' })
export class Beverage {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  style: string;

  @Field(() => Number)
  abv: number;

  @Field(() => String)
  description: string;

  @Field(() => String)
  producer_id: string;

  @Field(() => String)
  image_id: string;
}

@ObjectType({ description: 'keg' })
export class Keg {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  status: 'IN_STOCK' | 'IN_USE' | 'EMPTY';

  @Field(() => String)
  beverage_id: string;

  @Field(() => Beverage)
  beverage: Beverage;
}

@Resolver(() => Beverage)
export class BeverageResolver {
  @Query(() => Beverage)
  async beverage() {
    return { id: '1' };
  }
}

@Resolver(() => Keg)
export class KegsResolver {
  constructor(
    private readonly kegsService: KegsService,
    private readonly beverageService: BeveragesService,
  ) {}

  @Query(() => [Keg])
  async kegs() {
    return this.kegsService.getAllKegs();
  }

  @ResolveField()
  async beverage(@Parent() keg: Keg) {
    return await this.beverageService.getOneBeverage(keg.beverage_id);
  }
}
