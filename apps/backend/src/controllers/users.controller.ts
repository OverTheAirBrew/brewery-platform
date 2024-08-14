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
import { Public } from '../auth/public.decorator';
import { UsersService } from '../services/users.service';
import { ZodValidationPipe } from '../validation/validation.pipe';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Public()
  @Post('/login')
  @ApiOkResponse({
    type: TokenResponseDto,
    description: 'OK',
  })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(UserSchema))
  async login(@Body() userLoginDto: UserDto) {
    return this.userService.login(userLoginDto);
  }
}
