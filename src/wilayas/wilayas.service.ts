import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WilayasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.shipping_zones.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
      include: {
        shipping_communes: {
          where: { active: true },
          orderBy: { display_name: 'asc' },
        },
        shipping_rates: {
          orderBy: { min_value: 'asc' },
        },
      },
    });

    const withRates = data.map((zone) => {
      const { shipping_rates, ...rest } = zone;
      const fallback = shipping_rates[0];
      const defaultRate =
        shipping_rates.find(
          (rate) => rate.no_max && Number(rate.min_value) === 0,
        ) ?? fallback;

      return {
        ...rest,
        default_rate: defaultRate ? Number(defaultRate.price) : null,
        home_delivery_price: Number(rest.home_delivery_price ?? 0),
        office_delivery_price: Number(rest.office_delivery_price ?? 0),
        communes: zone.shipping_communes.map((commune) => ({
          ...commune,
          home_delivery_price: Number(commune.home_delivery_price ?? 0),
          office_delivery_price: Number(commune.office_delivery_price ?? 0),
        })),
      };
    });

    return { data: withRates };
  }
}
