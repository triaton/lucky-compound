import { ApiProperty } from '@nestjs/swagger';

export class WithdrawQuery {
  @ApiProperty()
  recipient: string;

  @ApiProperty()
  key: string;
}
