import { IsString , IsOptional} from 'class-validator';
import { ApiProperty , ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({
        example: 'Abdou Bendoouha',
    })
    @IsString()
    customer_name: string;

    @ApiProperty({ example: '+213 551234567' })
    @IsString()
    customer_phone: string;

    @ApiProperty({ example: 'Blida' })
    @IsString()
    customer_wilaya: string;

    @ApiPropertyOptional({ example: 'PAID' })
    @IsOptional()
    @IsString()
    status?: string;
}
