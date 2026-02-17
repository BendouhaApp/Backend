import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingCommuneDto } from './create-shipping-commune.dto';

export class UpdateShippingCommuneDto extends PartialType(
  CreateShippingCommuneDto,
) {}
