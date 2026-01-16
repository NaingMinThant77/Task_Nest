import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async findAll(): Promise<Task[]> {
    return await this.prismaService.task.findMany({
      include: {
        user: true
      }
    });
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
