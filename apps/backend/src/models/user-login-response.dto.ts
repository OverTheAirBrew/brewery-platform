import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponseDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;

  @ApiProperty({
    type: 'string',
  })
  name: string;

  @ApiProperty({
    type: 'string',
  })
  email: string;

  @ApiProperty({
    type: 'string',
  })
  image: string | null;

  @ApiProperty({
    type: 'string',
  })
  token: string;

  @ApiProperty({
    type: 'string',
  })
  emailHash: string;
}
