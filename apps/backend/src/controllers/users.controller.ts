// import { Injectable } from '@nestjs/common';
// import { sign } from 'jsonwebtoken';
// import { z } from 'zod';
// import { TrpcService } from '../trpc/trpc.service';
// import { ITrpcController } from './itrpccontroller';

import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { sign } from 'jsonwebtoken';
import { UserLoginResponseDto } from '../models/user-login-response.dto';
import { UserLoginDto } from '../models/user-login.dto';

// @Injectable()
// export class UsersController implements ITrpcController {
//   constructor(private readonly trpc: TrpcService) {}

//   router = this.trpc.router({
//     login: this.trpc.procedure
//       .input(
//         z.object({
//           email: z.string(),
//           password: z.string(),
//         }),
//       )
//       .query((input) => {
//         const userInformation = {
//           id: 'id',
//           name: 'name',
//           email: 'nick.sharp.87@gmail.com',
//           image: null,
//         };

//         return {
//           ...userInformation,
//           token: sign(userInformation, 'testing1234', { algorithm: 'HS256' }),
//         };
//       }),
//   });
// }

@ApiTags('users')
@Controller('/users')
export class UsersController {
  @Post('/login')
  @ApiOkResponse({
    type: UserLoginResponseDto,
    description: 'OK',
  })
  async login(@Body() userLoginDto: UserLoginDto) {
    const userInformation = {
      id: 'id',
      name: 'name',
      email: 'nick.sharp.87@gmail.com',
      image: null,
      emailHash: createHash('md5')
        .update('nick.sharp.87@gmail.com')
        .digest('hex'),
    };

    return {
      ...userInformation,
      token: sign(userInformation, 'testing1234', { algorithm: 'HS256' }),
    };
  }
}
