import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

const toBool = ({ value }: { value: any }) => {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const toNumber = ({ value }: { value: any }) => {
  if (value === null || value === undefined || value === '') return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
};

export class CreateShippingCommuneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'name must be lower-case (e.g. rouiba, ain-benian, bir-khadem)',
  })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => String(value).trim())
  display_name!: string;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  free_shipping?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  home_delivery_enabled?: boolean;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  home_delivery_price?: number;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  office_delivery_enabled?: boolean;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  office_delivery_price?: number;
}
