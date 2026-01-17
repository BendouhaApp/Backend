
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class OrdersDto {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
order_number: string ;
customer_name: string ;
customer_email: string ;
customer_phone: string  | null;
shipping_address: string ;
shipping_city: string  | null;
shipping_state: string  | null;
shipping_postal_code: string  | null;
shipping_country: string  | null;
billing_address: string  | null;
billing_city: string  | null;
billing_state: string  | null;
billing_postal_code: string  | null;
billing_country: string  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
subtotal: Prisma.Decimal ;
@ApiProperty({
  type: `number`,
  format: `double`,
})
tax_amount: Prisma.Decimal  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
shipping_cost: Prisma.Decimal  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
discount_amount: Prisma.Decimal  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
total_amount: Prisma.Decimal ;
notes: string  | null;
admin_notes: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
created_at: Date  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updated_at: Date  | null;
}
