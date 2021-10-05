import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
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
  readonly password!: string;
}
