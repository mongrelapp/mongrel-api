import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRefreshTokenDto {
  @ApiProperty({
    example: '26106050b61d1b7692a133a78f0a711ce74df13d98efd84b6d85f4a928bea5f8',
  })
  @IsNotEmpty()
  @IsString()
  readonly refreshToken: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;
}
