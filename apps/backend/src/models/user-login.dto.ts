import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  email: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  password: string;
}
