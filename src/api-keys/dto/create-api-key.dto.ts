import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly name!: string;
}
