import { Provider } from '@nestjs/common';

type Constructable<T = unknown> = abstract new (...args: any[]) => T;

export function createCollectionProvider<T>(
  token: symbol,
  providers: Constructable<T>[],
): Provider {
  return {
    provide: token,
    useFactory: (...instances: T[]) => instances,
    inject: providers,
  };
}
