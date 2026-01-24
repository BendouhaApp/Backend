import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const existingAdmin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { username: createAdminDto.username },
          { email: createAdminDto.email },
        ],
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Username or email already exists');
    }

    const password_hash = await bcrypt.hash(createAdminDto.password, 10);

    const { password, ...adminData } = createAdminDto;

    return this.prisma.admin.create({
      data: {
        ...adminData,
        password_hash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async findAll() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    await this.findOne(id);

    if (updateAdminDto.username || updateAdminDto.email) {
      const existingAdmin = await this.prisma.admin.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateAdminDto.username ? { username: updateAdminDto.username } : {},
                updateAdminDto.email ? { email: updateAdminDto.email } : {},
              ],
            },
          ],
        },
      });

      if (existingAdmin) {
        throw new ConflictException('Username or email already exists');
      }
    }

    const updateData: any = { ...updateAdminDto };

    if (updateAdminDto.password) {
      updateData.password_hash = await bcrypt.hash(updateAdminDto.password, 10);
      delete updateData.password;
    }

    return this.prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.admin.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  }
}