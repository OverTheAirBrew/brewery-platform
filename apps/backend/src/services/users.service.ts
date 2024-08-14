import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenResponseDto, UserDto } from '@overtheairbrew/models';
import { createHash } from 'crypto';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      userName: 'nick@overtheairbrew.com',
      password: 'password',
    },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async login(user: UserDto) {
    const fetchedUser = this.users.find(
      (u) => u.userName === user.email && u.password === user.password,
    );

    if (!fetchedUser) {
      throw new UnauthorizedException('Username or password was incorrect.');
    }

    const userInformation = {
      sub: fetchedUser.userId,
      username: fetchedUser.userName,
      emailHash: createHash('md5').update(fetchedUser.userName).digest('hex'),
    };

    return TokenResponseDto.zodSchema.parse({
      ...userInformation,
      token: await this.jwtService.signAsync(userInformation),
    });
  }
}
