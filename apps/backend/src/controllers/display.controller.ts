// import { Injectable } from '@nestjs/common';
// import { z } from 'zod';
// import { TrpcService } from '../trpc/trpc.service';
// import { ITrpcController } from './itrpccontroller';

import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// @Injectable()
// export class DisplaysController implements ITrpcController {
//   constructor(private readonly trpc: TrpcService) {}

//   router = this.trpc.router({
//     create: this.trpc.procedure
//       .input(
//         z.object({
//           name: z.string(),
//         }),
//       )
//       .mutation((input) => {
//         return {
//           id: 'id',
//         };
//       }),
//   });
// }

@ApiTags('displays')
@Controller('/displays')
export class DisplaysController {
  @Get('/')
  async get() {
    return {
      hello: 'world',
    };
  }
}
