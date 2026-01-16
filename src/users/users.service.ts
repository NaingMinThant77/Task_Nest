import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto, UpdateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable() 
export class UsersService {
  constructor(private readonly prismaService: PrismaService, private jwtService: JwtService,) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
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

  async login(dto: LoginDto) {
    // 1. Find user and include nested permissions for the frontend
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      include: { 
        role: { 
          include: { permission: true } 
        } 
      }
    });

    // 2. Check if user exists and password matches
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Create the JWT payload
    // 'sub' is the standard JWT field for the subject (user ID)
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name 
    };

    // 4. Return the token and user info for the Frontend state
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permission
      }
    };
  }

  async findAll(pagination: PaginationDto) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prismaService.user.findMany({
      skip,
      take: limit,
      select: { // Don't return passwords in the list
        id: true,
        name: true,
        email: true,
        role: true,
      },
    }),
    this.prismaService.user.count(),
  ]);

  return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
}

  async getProfile(id: number): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
            permission: true,
          },
        },
      },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        id
      },
      data: updateUserDto
    });
  }

  async remove(id: number): Promise<User> {
    return await this.prismaService.user.delete({
      where: {
        id
      }
    });
  }
}
