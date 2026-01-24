import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, files: Express.Multer.File[] = []): Promise<Task> {
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
     ...createTaskDto,
        attachments: {
          create: files.map(file => ({
            filename: file.originalname,
            path: file.filename,
            mimetype: file.mimetype
          }))
        }
    },
    include: { attachments: true }
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
      include: { user: true, attachments: true },
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

  async update(id: number, updateTaskDto: UpdateTaskDto, newFiles: Express.Multer.File[] = [], deleteFileIds?: number[]) {
    // 1. Delete physical files and DB records if requested
    if (deleteFileIds && deleteFileIds.length > 0) {
      const filesToDelete = await this.prismaService.attachment.findMany({
        where: { id: { in: deleteFileIds.map(id => Number(id)) } }
      });

      for (const file of filesToDelete) {
        const fullPath = join(process.cwd(), 'uploads', 'tasks', file.path);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }

      await this.prismaService.attachment.deleteMany({
        where: { id: { in: deleteFileIds.map(id => Number(id)) } }
      });
    }

    // 2. Update task and add new files
    return this.prismaService.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        attachments: {
          create: newFiles?.map(file => ({
            filename: file.originalname,
            path: file.filename,
            mimetype: file.mimetype
          }))
        }
      },
      include: { attachments: true }
    });
  }

  async remove(id: number): Promise<Task> {
    // 1. Find the task and its attachments first
    const task = await this.prismaService.task.findUnique({
      where: { id },
      include: { attachments: true }
    });

    if (!task) throw new NotFoundException('Task not found');

    // 2. Delete physical files from the disk
    if (task.attachments && task.attachments.length > 0) {
      for (const file of task.attachments) {
        const fullPath = join(process.cwd(), 'uploads', 'tasks', file.path);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.error(`Failed to delete file: ${fullPath}`, err);
          // We continue so the DB record can still be deleted
        }
      }
    }

    // 3. Delete from Database (Cascading will handle Attachment records if set in Prisma)
    return await this.prismaService.task.delete({
      where: { id }
    });
  }
}
