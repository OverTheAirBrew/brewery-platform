import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class TestResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }
}
