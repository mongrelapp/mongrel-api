import {
  IsString,
  IsNotEmpty,
  Matches, IsBoolean,
} from 'class-validator';

export class TwilioVerifyDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  orgName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{1,14}$/)
  phoneNumber: string;

  @IsBoolean()
  @IsNotEmpty()
  verified?: boolean;
}

export default TwilioVerifyDto;
