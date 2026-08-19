import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';

export interface SystemPermission {
  key: string;
  label: string;
  category: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermission[] = [
  // Dashboard
  {
    key: 'dashboard:read',
    label: 'View Dashboard',
    category: 'Dashboard',
    description: 'Access dashboard metrics and recent orders',
  },
  // Products
  {
    key: 'products:read',
    label: 'View Products',
    category: 'Products',
    description: 'View and search products catalog',
  },
  {
    key: 'products:create',
    label: 'Create Products',
    category: 'Products',
    description: 'Create new products with initial stock',
  },
  {
    key: 'products:update',
    label: 'Edit Products',
    category: 'Products',
    description:
      'Update product information, pricing, and adjust stock quantities',
  },
  {
    key: 'products:delete',
    label: 'Delete Products',
    category: 'Products',
    description: 'Delete individual or multiple products',
  },
  // Categories
  {
    key: 'categories:read',
    label: 'View Categories',
    category: 'Categories',
    description: 'View categories and subcategories',
  },
  {
    key: 'categories:create',
    label: 'Create Categories',
    category: 'Categories',
    description: 'Create new categories',
  },
  {
    key: 'categories:update',
    label: 'Edit Categories',
    category: 'Categories',
    description: 'Update existing categories',
  },
  {
    key: 'categories:delete',
    label: 'Delete Categories',
    category: 'Categories',
    description: 'Delete categories',
  },
  // Orders
  {
    key: 'orders:read',
    label: 'View Orders',
    category: 'Orders',
    description: 'View incoming and historical customer orders',
  },
  {
    key: 'orders:confirm',
    label: 'Confirm Orders',
    category: 'Orders',
    description: 'Confirm and validate pending orders',
  },
  {
    key: 'orders:update',
    label: 'Update Orders',
    category: 'Orders',
    description: 'Change order delivery and shipping statuses',
  },
  {
    key: 'orders:delete',
    label: 'Delete Orders',
    category: 'Orders',
    description: 'Delete or cancel orders',
  },
  // Shipping
  {
    key: 'shipping:read',
    label: 'View Shipping',
    category: 'Shipping',
    description: 'View wilayas, delivery communes and fees',
  },
  {
    key: 'shipping:update',
    label: 'Update Shipping',
    category: 'Shipping',
    description: 'Update wilaya rates and toggle home/office delivery',
  },
  // Marketing
  {
    key: 'marketing:read',
    label: 'View Marketing',
    category: 'Marketing',
    description: 'View Meta Pixel and CAPI configurations',
  },
  {
    key: 'marketing:update',
    label: 'Update Marketing',
    category: 'Marketing',
    description: 'Configure Meta Pixel and Conversions API',
  },
  // Logs
  {
    key: 'logs:read',
    label: 'View Logs',
    category: 'Logs',
    description: 'View admin action logs, audit trail, and activity metrics',
  },
  // Administration
  {
    key: 'admins:manage',
    label: 'Manage Admins & Roles',
    category: 'Administration',
    description:
      'Full management of admin accounts, passwords, and dynamic roles (Super Admin)',
  },
];

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRolesIfEmpty();
  }

  async seedDefaultRolesIfEmpty() {
    try {
      const superAdminRole = await this.prisma.roles.findFirst({
        where: { role_name: 'SUPER_ADMIN' },
      });

      let superAdminId: number;

      if (!superAdminRole) {
        const createdSuperAdmin = await this.prisma.roles.create({
          data: {
            role_name: 'SUPER_ADMIN',
            description: 'Full system access and administrator management',
            is_system: true,
            permissions: ['*'],
          },
        });
        superAdminId = createdSuperAdmin.id;
        this.logger.log('Seeded default SUPER_ADMIN system role');
      } else {
        superAdminId = superAdminRole.id;
        // Ensure SUPER_ADMIN role always retains wildcard permissions
        if (!superAdminRole.permissions.includes('*')) {
          await this.prisma.roles.update({
            where: { id: superAdminRole.id },
            data: { permissions: ['*'], is_system: true },
          });
        }
      }

      // Seed standard helper roles if they do not exist
      const defaultRoles = [
        {
          role_name: 'STORE_MANAGER',
          description:
            'Full management of products, categories, orders, shipping, and marketing',
          is_system: true,
          permissions: [
            'dashboard:read',
            'products:read',
            'products:create',
            'products:update',
            'products:delete',
            'categories:read',
            'categories:create',
            'categories:update',
            'categories:delete',
            'orders:read',
            'orders:confirm',
            'orders:update',
            'orders:delete',
            'shipping:read',
            'shipping:update',
            'marketing:read',
            'marketing:update',
            'logs:read',
          ],
        },
        {
          role_name: 'INVENTORY_MANAGER',
          description:
            'Responsible for catalog, stock inventory, and categories',
          is_system: true,
          permissions: [
            'dashboard:read',
            'products:read',
            'products:create',
            'products:update',
            'categories:read',
            'categories:create',
            'categories:update',
            'logs:read',
          ],
        },
        {
          role_name: 'ORDER_OPERATOR',
          description:
            'Handles customer order confirmation, status updates, and shipping tracking',
          is_system: true,
          permissions: [
            'dashboard:read',
            'orders:read',
            'orders:confirm',
            'orders:update',
            'products:read',
            'categories:read',
            'shipping:read',
          ],
        },
        {
          role_name: 'VIEWER',
          description: 'Read-only access across all business modules',
          is_system: true,
          permissions: [
            'dashboard:read',
            'products:read',
            'categories:read',
            'orders:read',
            'shipping:read',
            'marketing:read',
            'logs:read',
          ],
        },
      ];

      for (const roleDef of defaultRoles) {
        const existing = await this.prisma.roles.findFirst({
          where: { role_name: roleDef.role_name },
        });

        if (!existing) {
          await this.prisma.roles.create({
            data: roleDef,
          });
          this.logger.log(`Seeded default role: ${roleDef.role_name}`);
        }
      }

      // Link any legacy admin accounts with null role_id to SUPER_ADMIN
      const unassignedAdmins = await this.prisma.staff_accounts.updateMany({
        where: { role_id: null },
        data: { role_id: superAdminId },
      });

      if (unassignedAdmins.count > 0) {
        this.logger.log(
          `Assigned ${unassignedAdmins.count} unassigned admin(s) to SUPER_ADMIN role`,
        );
      }
    } catch (err) {
      this.logger.error('Error seeding default roles:', err);
    }
  }

  getAvailablePermissions(): SystemPermission[] {
    return SYSTEM_PERMISSIONS;
  }

  async findAll() {
    return this.prisma.roles.findMany({
      include: {
        _count: {
          select: { staff_accounts: true },
        },
      },
      orderBy: [{ is_system: 'desc' }, { created_at: 'asc' }],
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.roles.findUnique({
      where: { id },
      include: {
        _count: {
          select: { staff_accounts: true },
        },
        staff_accounts: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            active: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(dto: CreateRoleDto, actorAdminId?: string) {
    const normalizedName = dto.role_name.trim().toUpperCase();

    const existing = await this.prisma.roles.findUnique({
      where: { role_name: normalizedName },
    });

    if (existing) {
      throw new ConflictException(
        `Role with name "${normalizedName}" already exists`,
      );
    }

    const role = await this.prisma.roles.create({
      data: {
        role_name: normalizedName,
        description: dto.description?.trim() || null,
        permissions: dto.permissions || [],
        is_system: false,
      },
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.CREATE,
        entity: AdminEntity.ROLE,
        entityId: String(role.id),
        description: `Created custom role "${role.role_name}" with ${role.permissions.length} permissions`,
        metadata: {
          role_name: role.role_name,
          permissions: role.permissions,
        },
      });
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto, actorAdminId?: string) {
    const role = await this.findOne(id);

    const updateData: {
      role_name?: string;
      description?: string | null;
      permissions?: string[];
    } = {};

    if (dto.role_name) {
      const normalizedName = dto.role_name.trim().toUpperCase();

      if (role.is_system && role.role_name === 'SUPER_ADMIN' && normalizedName !== 'SUPER_ADMIN') {
        throw new BadRequestException('Cannot rename the SUPER_ADMIN system role');
      }

      if (normalizedName !== role.role_name) {
        const existing = await this.prisma.roles.findUnique({
          where: { role_name: normalizedName },
        });

        if (existing) {
          throw new ConflictException(
            `Role with name "${normalizedName}" already exists`,
          );
        }

        updateData.role_name = normalizedName;
      }
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description?.trim() || null;
    }

    if (dto.permissions !== undefined) {
      // Ensure SUPER_ADMIN always keeps wildcard access
      if (role.is_system && role.role_name === 'SUPER_ADMIN' && !dto.permissions.includes('*')) {
        updateData.permissions = ['*'];
      } else {
        updateData.permissions = dto.permissions;
      }
    }

    const updatedRole = await this.prisma.roles.update({
      where: { id },
      data: updateData,
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.UPDATE,
        entity: AdminEntity.ROLE,
        entityId: String(id),
        description: `Updated role "${updatedRole.role_name}"`,
        metadata: {
          updatedFields: Object.keys(updateData),
          permissionsCount: updatedRole.permissions.length,
        },
      });
    }

    return updatedRole;
  }

  async remove(id: number, actorAdminId?: string) {
    const role = await this.findOne(id);

    if (role.is_system || role.role_name === 'SUPER_ADMIN') {
      throw new BadRequestException('System built-in roles cannot be deleted');
    }

    const assignedCount = role._count?.staff_accounts ?? 0;
    if (assignedCount > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.role_name}" because it is currently assigned to ${assignedCount} admin account(s). Reassign them first.`,
      );
    }

    const deleted = await this.prisma.roles.delete({
      where: { id },
    });

    if (actorAdminId) {
      await this.adminsLogsService.log({
        adminId: actorAdminId,
        action: AdminAction.DELETE,
        entity: AdminEntity.ROLE,
        entityId: String(id),
        description: `Deleted role "${deleted.role_name}"`,
      });
    }

    return {
      message: `Role "${deleted.role_name}" deleted successfully`,
      data: deleted,
    };
  }
}
