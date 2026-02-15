import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoomDimensionsDto {
  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  length: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsOptional()
  @IsIn(['m'])
  unit?: 'm';
}

export class LightingProductDto {
  @IsNumber()
  @Min(1000)
  cct: number;

  @IsNumber()
  @Min(1)
  lumen: number;

  @IsNumber()
  @Min(1)
  cri: number;

  @IsNumber()
  @Min(1)
  power: number;

  @IsNumber()
  @Min(1)
  angle: number;
}

export class SimulateRoomDto {
  @IsString()
  @IsNotEmpty()
  roomType: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoomDimensionsDto)
  dimensions?: RoomDimensionsDto;

  @IsOptional()
  @IsArray()
  obstacles?: string[];

  @ValidateNested()
  @Type(() => LightingProductDto)
  product: LightingProductDto;
}
