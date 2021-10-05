import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateKeyValueDatabaseDto } from './create-key-value-database.dto';

export class UpdateKeyValueDatabaseDto extends PartialType(
  CreateKeyValueDatabaseDto,
) {
  /**
   * @example false
   */
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  readonly isActive?: boolean;
}
