import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  /**
   * @example John
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  readonly firstName!: string;

  /**
   * @example Doe
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  readonly lastName!: string;

  /**
   * @example johndoe@gmail.com
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email!: string;

  /**
   * @example password
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password!: string;

  /**
   * @example "+1 8052703003"
   */
  @IsNotEmpty()
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber!: string;
}
