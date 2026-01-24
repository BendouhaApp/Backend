import { Injectable , NotFoundException , ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        username: true,
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

    if (updateAdminDto.username) {
      const existingAdmin = await this.prisma.admin.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { username: updateAdminDto.username },
          ],
        },
      });

      if (existingAdmin) {
        throw new ConflictException('Username already exists');
      }
    }

    const updateData: any = { ...updateAdminDto };

    if (updateAdminDto.password) {
      updateData.password_hash = await bcrypt.hash(
        updateAdminDto.password,
        10,
      );
      delete updateData.password;
    }

    return this.prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
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
      },
    });
  }
}
