import { IsNotEmpty, IsString } from 'class-validator';

export class PutDataToKeyValueDatabaseDto {
  /**
   * This field is optional, if not passed then default empty object will be used
   */
  @IsNotEmpty()
  @IsString()
  readonly value?: string;
}
