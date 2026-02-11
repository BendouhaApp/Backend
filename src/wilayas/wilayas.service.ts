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
      };
    });

    return { data: withRates };
  }
}
