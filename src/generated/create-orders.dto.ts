
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'




export class CreateOrdersDto {
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
  required: false,
  nullable: true,
})
customer_phone?: string  | null;
@ApiProperty({
  type: 'string',
})
shipping_address: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
shipping_city?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
shipping_state?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
shipping_postal_code?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
shipping_country?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
billing_address?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
billing_city?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
billing_state?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
billing_postal_code?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
billing_country?: string  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
subtotal: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  default: 0,
  required: false,
  nullable: true,
})
tax_amount?: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  default: 0,
  required: false,
  nullable: true,
})
shipping_cost?: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  default: 0,
  required: false,
  nullable: true,
})
discount_amount?: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
total_amount: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
notes?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
admin_notes?: string  | null;
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
