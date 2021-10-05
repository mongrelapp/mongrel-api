import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum OperationTypeEnum {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export class UpdateMembersDto {
  /**
   * @example ["e76803e7-4d0a-450b-b31f-22186781af22"]
   */
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayUnique()
  readonly users: string[];

  @ApiProperty({
    example: OperationTypeEnum.ADD,
  })
  @IsNotEmpty()
  @IsEnum(OperationTypeEnum)
  readonly operationType: OperationTypeEnum;
}
