import { HttpException, HttpStatus } from '@nestjs/common';

export class PaykuException extends HttpException {
  public readonly paykuStatusCode: number | null;
  public readonly paykuMessage: string | null;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_GATEWAY,
    paykuStatusCode?: number,
    paykuMessage?: string,
  ) {
    super(message, statusCode);
    this.paykuStatusCode = paykuStatusCode ?? null;
    this.paykuMessage = paykuMessage ?? null;
  }
}
