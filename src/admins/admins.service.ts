import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  async findAll() {
    return this.prisma.staff_accounts.findMany({
      select: {
        id: true,
        username: true,
        active: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const admin = await this.prisma.staff_accounts.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        active: true,
        created_at: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async update(id: string, dto: UpdateAdminDto, actorAdminId?: string) {
    await this.findOne(id);

    if (dto.username) {
      const exists = await this.prisma.staff_accounts.findFirst({
        where: {
          username: dto.username,
          NOT: { id },
        },
      });

      if (exists) {
        throw new ConflictException('Username already exists');
      }
    }

    const data: {
      username?: string;
      active?: boolean;
      password_hash?: string;
    } = {};

    if (dto.username) data.username = dto.username;
    if (dto.active !== undefined) data.active = dto.active;

    if (dto.password) {
      data.password_hash = await bcrypt.hash(dto.password, 10);
    }

    const updatedAdmin = await this.prisma.staff_accounts.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        active: true,
        created_at: true,
      },
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.UPDATE,
        entity: AdminEntity.ADMIN,
        entityId: id,
        description: 'Updated admin account',
        metadata: {
          updatedFields: Object.keys(data),
        },
      });
    }

    return updatedAdmin;
  }

  async remove(id: string, actorAdminId?: string) {
    await this.findOne(id);

    const deletedAdmin = await this.prisma.staff_accounts.delete({
      where: { id },
      select: {
        id: true,
        username: true,
      },
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.DELETE,
        entity: AdminEntity.ADMIN,
        entityId: id,
        description: 'Deleted admin account',
      });
    }

    return deletedAdmin;
  }
}
