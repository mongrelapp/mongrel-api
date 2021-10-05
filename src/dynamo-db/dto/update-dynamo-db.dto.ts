import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateDynamoDbDto } from './create-dynamo-database.dto';

export class UpdateDynamoDbDto extends PartialType(CreateDynamoDbDto) {
  /**
   * @example false
   */
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  readonly isActive?: boolean;
}
