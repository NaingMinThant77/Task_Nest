import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = await this.prismaService.role.create({ data: {
      name: createRoleDto.name,
      permissions: {
        create: createRoleDto.permission
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
    return await this.prismaService.role.update({
      where: {
        id
      },
      data: {
        name: updateRoleDto.name
      },
      include: {
        permission: true
      }
    });
  }

  async remove(id: number): Promise<Role> {
    return await this.prismaService.role.delete({ where: { id } });
  }
}
