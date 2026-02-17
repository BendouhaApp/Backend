import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma, AdminAction, AdminEntity } from '@prisma/client'
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto'
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto'
import { CreateShippingCommuneDto } from './dto/create-shipping-commune.dto'
import { UpdateShippingCommuneDto } from './dto/update-shipping-commune.dto'
import { AdminsLogsService } from '../admins-logs/admins-logs.service'

@Injectable()
export class AdminWilayaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  async getAll() {
    const data = await this.prisma.shipping_zones.findMany({
      orderBy: { id: 'asc' },
      include: {
        shipping_communes: {
          orderBy: { display_name: 'asc' },
        },
        shipping_rates: {
          orderBy: { min_value: 'asc' },
        },
      },
    })

    const withRates = data.map((zone) => {
      const fallback = zone.shipping_rates[0]
      const defaultRate =
        zone.shipping_rates.find(
          (rate) => rate.no_max && Number(rate.min_value) === 0,
        ) ?? fallback

      return {
        ...zone,
        default_rate: defaultRate ? Number(defaultRate.price) : null,
        shipping_communes: zone.shipping_communes.map((commune) => ({
          ...commune,
          home_delivery_price: Number(commune.home_delivery_price ?? 0),
          office_delivery_price: Number(commune.office_delivery_price ?? 0),
        })),
      }
    })

    return { data: withRates }
  }

  async create(dto: CreateShippingZoneDto, adminId: string) {
    try {
      const zone = await this.prisma.shipping_zones.create({
        data: {
          ...this.normalizeCreate(dto),
          created_by: adminId,
        },
      })

      const rateValue =
        dto.default_rate ?? (dto.free_shipping ? 0 : 700)

      await this.prisma.shipping_rates.create({
        data: {
          shipping_zone_id: zone.id,
          min_value: new Prisma.Decimal(0),
          max_value: null,
          no_max: true,
          price: new Prisma.Decimal(rateValue),
        },
      })

      await this.prisma.shipping_communes.create({
        data: {
          shipping_zone_id: zone.id,
          name: zone.name,
          display_name: zone.display_name,
          active: zone.active,
          free_shipping: zone.free_shipping,
          home_delivery_enabled: zone.home_delivery_enabled,
          home_delivery_price: zone.home_delivery_price,
          office_delivery_enabled: zone.office_delivery_enabled,
          office_delivery_price: zone.office_delivery_price,
        },
      })

      await this.adminsLogsService.log({
        adminId,
        action: AdminAction.CREATE,
        entity: AdminEntity.SHIPPING,
        entityId: zone.id.toString(),
        description: `Wilaya created: ${zone.display_name}`,
        metadata: {
          name: zone.name,
          display_name: zone.display_name,
        },
      })

      return { data: zone }
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Wilaya name already exists')
      }
      throw e
    }
  }

  async update(id: number, dto: UpdateShippingZoneDto, adminId: string) {
    const before = await this.prisma.shipping_zones.findUnique({
      where: { id },
    })

    if (!before) {
      throw new NotFoundException('Wilaya not found')
    }

    try {
      const zone = await this.prisma.shipping_zones.update({
        where: { id },
        data: {
          ...this.normalizeUpdate(dto),
          updated_by: adminId,
        },
      })

      if (dto.default_rate !== undefined) {
        const existingRate = await this.prisma.shipping_rates.findFirst({
          where: {
            shipping_zone_id: id,
            no_max: true,
            min_value: new Prisma.Decimal(0),
          },
        })

        if (existingRate) {
          await this.prisma.shipping_rates.update({
            where: { id: existingRate.id },
            data: { price: new Prisma.Decimal(dto.default_rate) },
          })
        } else {
          await this.prisma.shipping_rates.create({
            data: {
              shipping_zone_id: id,
              min_value: new Prisma.Decimal(0),
              max_value: null,
              no_max: true,
              price: new Prisma.Decimal(dto.default_rate),
            },
          })
        }
      }

      await this.adminsLogsService.log({
        adminId,
        action: AdminAction.UPDATE,
        entity: AdminEntity.SHIPPING,
        entityId: id.toString(),
        description: `Wilaya updated: ${zone.display_name}`,
        metadata: {
          before,
          after: zone,
        },
      })

      return { data: zone }
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Wilaya name already exists')
      }
      throw e
    }
  }

  async remove(id: number, adminId: string) {
    const zone = await this.prisma.shipping_zones.findUnique({
      where: { id },
    })

    if (!zone) {
      throw new NotFoundException('Wilaya not found')
    }

    try {
      await this.prisma.shipping_zones.delete({ where: { id } })

      await this.adminsLogsService.log({
        adminId,
        action: AdminAction.DELETE,
        entity: AdminEntity.SHIPPING,
        entityId: id.toString(),
        description: `Wilaya deleted: ${zone.display_name}`,
        metadata: {
          name: zone.name,
          display_name: zone.display_name,
        },
      })

      return { success: true }
    } catch {
      throw new ConflictException(
        'This wilaya is used by other records. Disable it instead.',
      )
    }
  }

  async getCommunes(zoneId: number) {
    await this.ensureZoneExists(zoneId)

    const communes = await this.prisma.shipping_communes.findMany({
      where: { shipping_zone_id: zoneId },
      orderBy: { display_name: 'asc' },
    })

    return {
      data: communes.map((commune) => ({
        ...commune,
        home_delivery_price: Number(commune.home_delivery_price ?? 0),
        office_delivery_price: Number(commune.office_delivery_price ?? 0),
      })),
    }
  }

  async createCommune(
    zoneId: number,
    dto: CreateShippingCommuneDto,
    adminId: string,
  ) {
    const zone = await this.ensureZoneExists(zoneId)

    try {
      const commune = await this.prisma.shipping_communes.create({
        data: {
          ...this.normalizeCommuneCreate(zoneId, dto),
        },
      })

      await this.adminsLogsService.log({
        adminId,
        action: AdminAction.CREATE,
        entity: AdminEntity.SHIPPING,
        entityId: `${zoneId}:${commune.id}`,
        description: `Commune created in ${zone.display_name}: ${commune.display_name}`,
      })

      return {
        data: {
          ...commune,
          home_delivery_price: Number(commune.home_delivery_price ?? 0),
          office_delivery_price: Number(commune.office_delivery_price ?? 0),
        },
      }
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Commune name already exists in this wilaya')
      }
      throw e
    }
  }

  async updateCommune(
    zoneId: number,
    communeId: number,
    dto: UpdateShippingCommuneDto,
    adminId: string,
  ) {
    const zone = await this.ensureZoneExists(zoneId)
    const before = await this.prisma.shipping_communes.findFirst({
      where: {
        id: communeId,
        shipping_zone_id: zoneId,
      },
    })

    if (!before) {
      throw new NotFoundException('Commune not found')
    }

    try {
      const commune = await this.prisma.shipping_communes.update({
        where: { id: communeId },
        data: this.normalizeCommuneUpdate(dto),
      })

      await this.adminsLogsService.log({
        adminId,
        action: AdminAction.UPDATE,
        entity: AdminEntity.SHIPPING,
        entityId: `${zoneId}:${communeId}`,
        description: `Commune updated in ${zone.display_name}: ${commune.display_name}`,
        metadata: { before, after: commune },
      })

      return {
        data: {
          ...commune,
          home_delivery_price: Number(commune.home_delivery_price ?? 0),
          office_delivery_price: Number(commune.office_delivery_price ?? 0),
        },
      }
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Commune name already exists in this wilaya')
      }
      throw e
    }
  }

  async removeCommune(zoneId: number, communeId: number, adminId: string) {
    const zone = await this.ensureZoneExists(zoneId)
    const commune = await this.prisma.shipping_communes.findFirst({
      where: {
        id: communeId,
        shipping_zone_id: zoneId,
      },
    })

    if (!commune) {
      throw new NotFoundException('Commune not found')
    }

    try {
      await this.prisma.shipping_communes.delete({
        where: { id: communeId },
      })

      await this.adminsLogsService.log({
        adminId,
        action: AdminAction.DELETE,
        entity: AdminEntity.SHIPPING,
        entityId: `${zoneId}:${communeId}`,
        description: `Commune deleted from ${zone.display_name}: ${commune.display_name}`,
      })

      return { success: true }
    } catch {
      throw new ConflictException(
        'This commune is used by existing orders. Disable it instead.',
      )
    }
  }

  private async ensureZoneExists(zoneId: number) {
    const zone = await this.prisma.shipping_zones.findUnique({
      where: { id: zoneId },
    })

    if (!zone) {
      throw new NotFoundException('Wilaya not found')
    }

    return zone
  }

  private normalizeCommuneCreate(
    zoneId: number,
    dto: CreateShippingCommuneDto,
  ): Prisma.shipping_communesUncheckedCreateInput {
    return {
      shipping_zone_id: zoneId,
      name: dto.name,
      display_name: dto.display_name,
      active: dto.active ?? true,
      free_shipping: dto.free_shipping ?? false,
      home_delivery_enabled: dto.home_delivery_enabled ?? true,
      home_delivery_price: this.price(
        dto.free_shipping,
        dto.home_delivery_enabled,
        dto.home_delivery_price,
      ),
      office_delivery_enabled: dto.office_delivery_enabled ?? true,
      office_delivery_price: this.price(
        dto.free_shipping,
        dto.office_delivery_enabled,
        dto.office_delivery_price,
      ),
    }
  }

  private normalizeCommuneUpdate(
    dto: UpdateShippingCommuneDto,
  ): Prisma.shipping_communesUncheckedUpdateInput {
    const data: Prisma.shipping_communesUncheckedUpdateInput = {}

    if (dto.name !== undefined) data.name = dto.name
    if (dto.display_name !== undefined) data.display_name = dto.display_name
    if (dto.active !== undefined) data.active = dto.active
    if (dto.free_shipping !== undefined) data.free_shipping = dto.free_shipping

    if (dto.home_delivery_enabled !== undefined) {
      data.home_delivery_enabled = dto.home_delivery_enabled
    }
    if (dto.office_delivery_enabled !== undefined) {
      data.office_delivery_enabled = dto.office_delivery_enabled
    }

    if (
      dto.free_shipping !== undefined ||
      dto.home_delivery_enabled !== undefined ||
      dto.home_delivery_price !== undefined
    ) {
      data.home_delivery_price = this.price(
        dto.free_shipping,
        dto.home_delivery_enabled,
        dto.home_delivery_price,
      )
    }

    if (
      dto.free_shipping !== undefined ||
      dto.office_delivery_enabled !== undefined ||
      dto.office_delivery_price !== undefined
    ) {
      data.office_delivery_price = this.price(
        dto.free_shipping,
        dto.office_delivery_enabled,
        dto.office_delivery_price,
      )
    }

    return data
  }

  private normalizeCreate(
    dto: CreateShippingZoneDto,
  ): Prisma.shipping_zonesUncheckedCreateInput {
    return {
      name: dto.name,
      display_name: dto.display_name,
      active: dto.active ?? true,
      free_shipping: dto.free_shipping ?? false,
      rate_type: dto.rate_type ?? null,

      home_delivery_enabled: dto.home_delivery_enabled ?? true,
      office_delivery_enabled: dto.office_delivery_enabled ?? true,

      home_delivery_price: this.price(
        dto.free_shipping,
        dto.home_delivery_enabled,
        dto.home_delivery_price,
      ),

      office_delivery_price: this.price(
        dto.free_shipping,
        dto.office_delivery_enabled,
        dto.office_delivery_price,
      ),
    }
  }

  private normalizeUpdate(
    dto: UpdateShippingZoneDto,
  ): Prisma.shipping_zonesUncheckedUpdateInput {
    const data: Prisma.shipping_zonesUncheckedUpdateInput = {}

    if (dto.name !== undefined) data.name = dto.name
    if (dto.display_name !== undefined) data.display_name = dto.display_name
    if (dto.active !== undefined) data.active = dto.active
    if (dto.free_shipping !== undefined) data.free_shipping = dto.free_shipping
    if (dto.rate_type !== undefined) data.rate_type = dto.rate_type

    if (dto.home_delivery_enabled !== undefined)
      data.home_delivery_enabled = dto.home_delivery_enabled

    if (dto.office_delivery_enabled !== undefined)
      data.office_delivery_enabled = dto.office_delivery_enabled

    if (
      dto.free_shipping !== undefined ||
      dto.home_delivery_enabled !== undefined ||
      dto.home_delivery_price !== undefined
    ) {
      data.home_delivery_price = this.price(
        dto.free_shipping,
        dto.home_delivery_enabled,
        dto.home_delivery_price,
      )
    }

    if (
      dto.free_shipping !== undefined ||
      dto.office_delivery_enabled !== undefined ||
      dto.office_delivery_price !== undefined
    ) {
      data.office_delivery_price = this.price(
        dto.free_shipping,
        dto.office_delivery_enabled,
        dto.office_delivery_price,
      )
    }

    return data
  }
  
  private price(
    free?: boolean,
    enabled?: boolean,
    value?: number,
  ): Prisma.Decimal {
    if (free === true) return new Prisma.Decimal(0)
    if (enabled === false) return new Prisma.Decimal(0)
    if (value === undefined) return new Prisma.Decimal(0)
    return new Prisma.Decimal(value)
  }
}
