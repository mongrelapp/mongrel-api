import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  readonly firstName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  readonly lastName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;
}
