
import {Prisma} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateOrdersDto {
  order_number: string;
customer_name: string;
customer_email: string;
customer_phone?: string;
shipping_address: string;
shipping_city?: string;
shipping_state?: string;
shipping_postal_code?: string;
shipping_country?: string;
billing_address?: string;
billing_city?: string;
billing_state?: string;
billing_postal_code?: string;
billing_country?: string;
@ApiProperty({
  type: `number`,
  format: `double`,
})
subtotal: Prisma.Decimal;
@ApiProperty({
  type: `number`,
  format: `double`,
  default: 0,
})
tax_amount?: Prisma.Decimal;
@ApiProperty({
  type: `number`,
  format: `double`,
  default: 0,
})
shipping_cost?: Prisma.Decimal;
@ApiProperty({
  type: `number`,
  format: `double`,
  default: 0,
})
discount_amount?: Prisma.Decimal;
@ApiProperty({
  type: `number`,
  format: `double`,
})
total_amount: Prisma.Decimal;
notes?: string;
admin_notes?: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
  default: `now`,
})
created_at?: Date;
@ApiProperty({
  type: `string`,
  format: `date-time`,
  default: `now`,
})
updated_at?: Date;
}
