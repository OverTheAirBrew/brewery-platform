import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationKeyNoLongerValidError extends HttpException {
  constructor(authenticationKey: string) {
    super(
      `Authentication Key with id ${authenticationKey} is no longer value`,
      HttpStatus.GONE,
    );
  }
}
