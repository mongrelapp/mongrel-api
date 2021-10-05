import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InviteUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(256)
  readonly firstName!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  readonly lastName!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;
}
