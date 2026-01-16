import { Injectable } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto  } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = await this.prismaService.role.create({ data: {
      name: createRoleDto.name,
      permission: {
        create: createRoleDto.permission as Prisma.PermissionCreateManyInput[]
      }
    } });
    return role;
  }

  async findAll() {
    return await this.prismaService.role.findMany();
  }

  async findOne(id: number): Promise<Role | null> {
    return await this.prismaService.role.findUnique({ where: { id }, include: { permission: true } });
  }

async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
  // We use $transaction to ensure both operations succeed or both fail
  return await this.prismaService.$transaction(async (tx) => {
    
    // 1. If permissions are provided, clear the old ones first
    if (updateRoleDto.permission) {
      await tx.permission.deleteMany({
        where: { id }, // Assuming you have a roleId field in Permission
      });
    }

    // 2. Update the Role name and create new permissions
    return await tx.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        permission: updateRoleDto.permission ? {
          create: updateRoleDto.permission as Prisma.PermissionCreateManyInput[],
        } : undefined,
      },
      include: {
        permission: true, // Return the updated list
      },
    });
  });
}

  async remove(id: number): Promise<Role> {
    return await this.prismaService.role.delete({ where: { id } });
  }
}
