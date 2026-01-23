
import {ApiProperty} from '@nestjs/swagger'


export class ProductSubtypesDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
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
  nullable: true,
})
description: string  | null;
@ApiProperty({
  type: 'boolean',
  nullable: true,
})
is_active: boolean  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
created_at: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
updated_at: Date  | null;
}
