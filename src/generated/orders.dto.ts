
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'


export class OrdersDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
order_number: string ;
@ApiProperty({
  type: 'string',
})
customer_name: string ;
@ApiProperty({
  type: 'string',
})
customer_email: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
customer_phone: string  | null;
@ApiProperty({
  type: 'string',
})
shipping_address: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
shipping_city: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
shipping_state: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
shipping_postal_code: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
shipping_country: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
billing_address: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
billing_city: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
billing_state: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
billing_postal_code: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
billing_country: string  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
subtotal: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  nullable: true,
})
tax_amount: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  nullable: true,
})
shipping_cost: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  nullable: true,
})
discount_amount: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
total_amount: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
notes: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
admin_notes: string  | null;
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
