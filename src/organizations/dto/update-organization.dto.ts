import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  readonly name: string;
}
