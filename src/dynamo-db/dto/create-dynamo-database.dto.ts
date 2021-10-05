import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDynamoDbDto {
  /**
   * @example demo_database
   */
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'The table should only contain alpha, numerics & dashes',
  })
  @MinLength(3)
  @MaxLength(255)
  readonly tableName!: string;
}
