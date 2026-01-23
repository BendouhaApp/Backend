
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'
import {OrderItems} from './orderItems.entity'
import {Admins} from './admins.entity'
import {OrderStatuses} from './orderStatuses.entity'


export class Orders {
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
  type: 'integer',
  format: 'int32',
})
status_id: number ;
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
  type: 'integer',
  format: 'int32',
  nullable: true,
})
created_by: number  | null;
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
@ApiProperty({
  type: () => OrderItems,
  isArray: true,
  required: false,
})
order_items?: OrderItems[] ;
@ApiProperty({
  type: () => Admins,
  required: false,
  nullable: true,
})
admins?: Admins  | null;
@ApiProperty({
  type: () => OrderStatuses,
  required: false,
})
order_statuses?: OrderStatuses ;
}
