import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
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

  async create(dto: CreateAdminDto, actorAdminId?: string) {
    const normalizedUsername = dto.username.trim().toLowerCase();

    const exists = await this.prisma.staff_accounts.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: 'insensitive',
        },
      },
    });

    if (exists) {
      throw new ConflictException(`Username "${normalizedUsername}" already exists`);
    }

    const role = await this.prisma.roles.findUnique({
      where: { id: dto.role_id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${dto.role_id} does not exist`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const createdAdmin = await this.prisma.staff_accounts.create({
      data: {
        username: normalizedUsername,
        password_hash: passwordHash,
        first_name: dto.first_name.trim(),
        last_name: dto.last_name.trim(),
        phone_number: dto.phone_number?.trim() || null,
        role_id: dto.role_id,
        active: dto.active ?? true,
        created_by: actorAdminId || null,
      },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        active: true,
        role_id: true,
        roles: {
          select: {
            id: true,
            role_name: true,
            permissions: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.CREATE,
        entity: AdminEntity.ADMIN,
        entityId: createdAdmin.id,
        description: `Created admin account "${createdAdmin.username}" with role "${role.role_name}"`,
        metadata: {
          username: createdAdmin.username,
          role_name: role.role_name,
          role_id: role.id,
          active: createdAdmin.active,
        },
      });
    }

    return createdAdmin;
  }

  async findAll() {
    return this.prisma.staff_accounts.findMany({
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        active: true,
        role_id: true,
        roles: {
          select: {
            id: true,
            role_name: true,
            permissions: true,
          },
        },
        last_login_at: true,
        created_at: true,
        updated_at: true,
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
        first_name: true,
        last_name: true,
        phone_number: true,
        active: true,
        role_id: true,
        roles: {
          select: {
            id: true,
            role_name: true,
            permissions: true,
          },
        },
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin account not found');
    }

    return admin;
  }

  async update(id: string, dto: UpdateAdminDto, actorAdminId?: string) {
    const currentAdmin = await this.findOne(id);

    if (dto.username) {
      const normalizedUsername = dto.username.trim().toLowerCase();
      const exists = await this.prisma.staff_accounts.findFirst({
        where: {
          username: {
            equals: normalizedUsername,
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (exists) {
        throw new ConflictException(`Username "${normalizedUsername}" is already taken`);
      }
    }

    if (dto.role_id) {
      const roleExists = await this.prisma.roles.findUnique({
        where: { id: dto.role_id },
      });

      if (!roleExists) {
        throw new NotFoundException(`Role with ID ${dto.role_id} does not exist`);
      }
    }

    // Protect self-deactivation
    if (dto.active === false && actorAdminId && id === actorAdminId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const data: {
      username?: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string | null;
      role_id?: number;
      active?: boolean;
      password_hash?: string;
      token_version?: { increment: number };
      updated_by?: string;
    } = {};

    if (dto.username) data.username = dto.username.trim().toLowerCase();
    if (dto.first_name) data.first_name = dto.first_name.trim();
    if (dto.last_name) data.last_name = dto.last_name.trim();
    if (dto.phone_number !== undefined) data.phone_number = dto.phone_number?.trim() || null;
    if (dto.role_id !== undefined) data.role_id = dto.role_id;
    if (dto.active !== undefined) data.active = dto.active;
    if (actorAdminId) data.updated_by = actorAdminId;

    if (dto.password) {
      data.password_hash = await bcrypt.hash(dto.password, 10);
      // Invalidate existing access tokens on password reset
      data.token_version = { increment: 1 };
    }

    const updatedAdmin = await this.prisma.staff_accounts.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        active: true,
        role_id: true,
        roles: {
          select: {
            id: true,
            role_name: true,
            permissions: true,
          },
        },
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.UPDATE,
        entity: AdminEntity.ADMIN,
        entityId: id,
        description: `Updated admin account "${updatedAdmin.username}"`,
        metadata: {
          updatedFields: Object.keys(dto),
          previousRole: currentAdmin.roles?.role_name,
          newRole: updatedAdmin.roles?.role_name,
        },
      });
    }

    return updatedAdmin;
  }

  async remove(id: string, actorAdminId?: string) {
    const admin = await this.findOne(id);

    if (actorAdminId && id === actorAdminId) {
      throw new BadRequestException('You cannot delete your own admin account');
    }

    // If deleting a Super Admin, verify that at least one other active Super Admin remains
    if (admin.roles?.role_name === 'SUPER_ADMIN') {
      const remainingSuperAdmins = await this.prisma.staff_accounts.count({
        where: {
          roles: { role_name: 'SUPER_ADMIN' },
          active: true,
          NOT: { id },
        },
      });

      if (remainingSuperAdmins === 0) {
        throw new BadRequestException('Cannot delete the only remaining active Super Admin account');
      }
    }

    // Clean up refresh tokens first
    await this.prisma.admin_refresh_tokens.deleteMany({
      where: { admin_id: id },
    });

    const deletedAdmin = await this.prisma.staff_accounts.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
      },
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.DELETE,
        entity: AdminEntity.ADMIN,
        entityId: id,
        description: `Deleted admin account "${deletedAdmin.username}"`,
      });
    }

    return {
      message: `Admin account "${deletedAdmin.username}" deleted successfully`,
      data: deletedAdmin,
    };
  }
}
