
import {ApiProperty} from '@nestjs/swagger'




export class CreateProductSubtypesDto {
  @ApiProperty({
  type: 'string',
})
name: string ;
@ApiProperty({
  type: 'string',
})
slug: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
description?: string  | null;
@ApiProperty({
  type: 'boolean',
  default: true,
  required: false,
  nullable: true,
})
is_active?: boolean  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
  nullable: true,
})
created_at?: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
  nullable: true,
})
updated_at?: Date  | null;
}
