// import { UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Test } from '@nestjs/testing';
// import { UsersService } from './sensors.service';

import { it } from 'vitest';

// import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// import { vi } from 'vitest';

// describe('UsersService', () => {
//   let usersService: UsersService;

//   const mockJwtService = {
//     signAsync: vi.fn(),
//   };

//   beforeEach(async () => {
//     const module = await Test.createTestingModule({
//       providers: [
//         UsersService,

//         {
//           provide: JwtService,
//           useValue: mockJwtService,
//         },
//       ],
//     }).compile();

//     mockJwtService.signAsync.mockResolvedValue('token');

//     usersService = module.get<UsersService>(UsersService);
//   });

//   afterEach(() => {
//     vi.resetAllMocks();
//   });

//   describe('login', () => {
//     it('should return a token when the user is found', async () => {
//       const result = await usersService.login({
//         email: 'nick@overtheairbrew.com',
//         password: 'password',
//       });

//       expect(result).toMatchObject({
//         sub: 1,
//         username: 'nick@overtheairbrew.com',
//         emailHash: expect.any(String),
//         token: expect.any(String),
//       });
//     });

//     it('should throw an error when the user is not found', async () => {
//       await expect(
//         usersService.login({
//           email: '',
//           password: '',
//         }),
//       ).rejects.toThrow(UnauthorizedException);
//     });
//   });
// });

it.todo('should return a token when the user is found');
