import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
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

  findAll(): Promise<Task[]> {
    return this.prismaService.task.findMany({
      include: {
        user: true
      }
    });
  }

  findOne(id: number): Promise<Task | null> {
    return this.prismaService.task.findUnique({
      where: {
        id
      }
    });
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.prismaService.task.update({
      where: {
        id
      },
      data: updateTaskDto
    });
  }

  remove(id: number): Promise<Task> {
    return this.prismaService.task.delete({
      where: {
        id
      }
    });
  }
}
