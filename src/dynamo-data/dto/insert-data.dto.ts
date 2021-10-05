import { IsNotEmpty, IsObject } from 'class-validator';

export class InsertDataDto {
  @IsNotEmpty()
  @IsObject()
  readonly data: Record<string, any>;
}
