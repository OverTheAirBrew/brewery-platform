import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TokenResponseDto, UserDto, UserSchema } from '@overtheairbrew/models';
import { Public } from '../../auth/public.decorator';
import { UsersService } from './users.service';
import { ZodBodyValidationPipe } from '../../validation/validation.pipe';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';

/* istanbul ignore start */
@ApiTags('users')
@Controller('/users')
export class UsersController {
  /* istanbul ignore stop */
  constructor(private readonly userService: UsersService) {}

  @Public()
  @Post('/login')
  @ApiOkResponse({
    type: TokenResponseDto,
    description: 'OK',
  })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodBodyValidationPipe(UserSchema))
  async login(@Body() userLoginDto: UserDto) {
    return this.userService.login(userLoginDto);
  }

  @MessagePattern('critical-events', Transport.MQTT)
  handleCriticalEvent(@Payload() data: any) {
    console.log(data);
  }
}
