import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable() 
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email
      }
    })

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
        roleId: createUserDto.roleId
      }
    })

    return user;
  }

  findAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  findOne(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        id
      }
    });
  }

  update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: {
        id
      },
      data: updateUserDto
    });
  }

  remove(id: number): Promise<User> {
    return this.prismaService.user.delete({
      where: {
        id
      }
    });
  }
}
