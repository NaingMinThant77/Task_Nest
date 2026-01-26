import {  Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto, UpdateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as fs from 'fs';
import * as path from 'path';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager'

@Injectable() 
export class UsersService {
  constructor(private readonly prismaService: PrismaService, private jwtService: JwtService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async register(createUserDto: CreateUserDto): Promise<User> {

    // const existingUser = await this.prismaService.user.findUnique({
    //   where: {
    //     email: createUserDto.email
    //   }
    // })

    // if (existingUser) {
    //   throw new ConflictException('User already exists');
    // }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
        roleId: 2
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

    // Clear user cache on login to ensure they have fresh permissions
    await this.cacheManager.del(`user_profile_${user.id}`);

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

async updateProfilePhoto(userId: number, newFilename: string) {
  const user = await this.prismaService.user.findUnique({
    where: { id: userId },
    select: { profilePhoto: true },
  });

  if (!user) throw new NotFoundException('User not found');

  // Delete old photo
  if (user.profilePhoto) {
    const oldPath = path.join(
      process.cwd(),
      'uploads',
      'profiles',
      user.profilePhoto,
    );

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }
  

  // Update user
  const updatedUser = await this.prismaService.user.update({
    where: { id: userId },
    data: { profilePhoto: newFilename },
    select: {
      id: true,
      name: true,
      profilePhoto: true,
    },
  });

  await this.cacheManager.del(`user_profile_${userId}`); // Invalidate Cache
  return {
    ...updatedUser,
    profilePhotoUrl: `${process.env.APP_URL}/uploads/profiles/${updatedUser.profilePhoto}`

  };
}


  async findAll(pagination: PaginationDto) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  const search = pagination.search || '';
  const name = pagination.name || '';
  const email = pagination.email || '';
  // Define the search filter
  // const where = search ? {
  //   OR: [
  //     { email: { contains: search } }, // Prisma mode insensitive is default in some DBs, or add:
  //     { name: { contains: search } },
  //   ],
  // } : {};

  // Advanced filtering logic
const conditions: any[] = [];

  // 1. If global search is used
  if (search) {
  conditions.push({
    OR: [
      { name: { contains: search } },
      { email: { contains: search } }
    ]
  });
}

if (name) conditions.push({ name: { contains: name } });
if (email) conditions.push({ email: { contains: email } });

// Finally, only add AND if there are conditions:
const finalWhere = conditions.length > 0 ? { AND: conditions } : {};

  // Define the sort order
  const sortBy = pagination.sortBy || 'createdAt';
  const sortOrder = pagination.sortOrder === 'asc' ? 'asc' : 'desc';

  const [data, total] = await Promise.all([
    this.prismaService.user.findMany({
      where: finalWhere, //where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: { // Don't return passwords in the list
        id: true,
        name: true,
        email: true,
       role: { select: { name: true } },
        createdAt: true,
        updatedAt: true
      },
    }),
    this.prismaService.user.count({ where: finalWhere }),
  ]);

  return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
}

  async getProfile(id: number): Promise<any> {
        const cacheKey = `user_profile_${id}`;
    const cachedUser = await this.cacheManager.get(cacheKey);
    if (cachedUser) return cachedUser;

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(id) },
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
        createdAt: true,
        updatedAt: true
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

   await this.cacheManager.set(cacheKey, user, 1800000); // Cache for 30 mins
       console.log('Setting cache for key:', cacheKey)
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
