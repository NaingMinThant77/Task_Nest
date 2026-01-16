import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const userId = await this.prismaService.user.findUnique({
      where: {
        id: createTaskDto.userId
      }
    })
    if(!userId) {
      throw new NotFoundException('User not found');
    }

    const task = await this.prismaService.task.create({
    data: {
      name: createTaskDto.name,
      description: createTaskDto.description,
      status: createTaskDto.status,
      userId: createTaskDto.userId, 
    },
  });

    return task;
  }

  async findAll(pagination: PaginationDto) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  const search = pagination.search || '';
  const where = search ? {
    name: { contains: search },
  } : {};

  // Define the sort order
  const sortBy = pagination.sortBy || 'createdAt';
  const sortOrder = pagination.sortOrder === 'asc' ? 'asc' : 'desc';

  const [data, total] = await Promise.all([
    this.prismaService.task.findMany({
      where,
      skip,
      take: limit,
      include: { user: true },
      orderBy: { [sortBy]: sortOrder }, // Newest tasks first
    }),
    this.prismaService.task.count({where}),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}

  async findOne(id: number): Promise<Task | null> {
    return await this.prismaService.task.findUnique({
      where: {
        id
      }
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return await this.prismaService.task.update({
      where: {
        id
      },
      data: updateTaskDto
    });
  }

  async remove(id: number): Promise<Task> {
    return await this.prismaService.task.delete({
      where: {
        id
      }
    });
  }
}
