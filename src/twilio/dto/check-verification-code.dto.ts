import { IsString, IsNotEmpty, Matches, IsBoolean } from 'class-validator';

export class CheckVerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{1,14}$/)
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsBoolean()
  @IsNotEmpty()
  verified?: boolean;
}

export default CheckVerificationCodeDto;
