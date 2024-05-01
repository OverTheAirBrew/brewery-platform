import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { sign } from 'jsonwebtoken';
import { UserLoginResponseDto } from '../models/user-login-response.dto';
import { UserLoginDto } from '../models/user-login.dto';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  @Post('/login')
  @ApiOkResponse({
    type: UserLoginResponseDto,
    description: 'OK',
  })
  async login(@Body() userLoginDto: UserLoginDto) {
    if (
      userLoginDto.email === 'nick.sharp@overtheairbrew.com' &&
      userLoginDto.password === 'password'
    ) {
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

    throw new UnauthorizedException('Username or password was incorrect.');
  }
}
