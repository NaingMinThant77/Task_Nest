import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { type CreateTaskDto, CreateTaskSchema, type UpdateTaskDto, UpdateTaskSchema } from './dto/create-task.dto';
import { UseSchema } from 'src/common/decorators/use-schema.decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { PaginationSchema, type PaginationDto } from 'src/common/dto/pagination.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { taskMulterOptions } from 'src/common/helpers/multer-config.helper';

@Controller('tasks')
@UseGuards(JwtAuthGuard) // Everything in this controller requires login
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, taskMulterOptions))
  async create(@Body() createTaskDto: CreateTaskDto, @UploadedFiles() files: Express.Multer.File[]) {
    // 2. Manually validate using your schema because @UseSchema 
  // might be firing before Multer populates the body.
  const validatedData = await CreateTaskSchema.validate(createTaskDto, {
    abortEarly: false,
    stripUnknown: true,
  });
    const dto = { ...validatedData, userId: Number(createTaskDto.userId) };
    return this.tasksService.create(dto, files || []);
  }

  @Get()
  @UseSchema(PaginationSchema) // Validates ?page=X&limit=Y
findAll(@Query() pagination: PaginationDto) {
  return this.tasksService.findAll(pagination);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

@Patch(':id')
@UseInterceptors(FilesInterceptor('files', 10, taskMulterOptions))
async update(
  @Param('id') id: string, 
  @Body() updateTaskDto: UpdateTaskDto, 
  @UploadedFiles() files: Express.Multer.File[]
) {
  // 1. Manually validate using the Schema
  // This handles the string-to-number conversion if you have .transform() in your schema
  const validatedData = await UpdateTaskSchema.validate(updateTaskDto, {
    abortEarly: false,
    stripUnknown: true,
  });

  // 2. Extract deleteFileIds and the rest of the task data
  const { deleteFileIds, ...updateDto } = validatedData;

  // 3. Normalize deleteFileIds (Convert single strings or arrays of strings to number[])
  let deleteIds: number[] = [];
  if (deleteFileIds) {
    deleteIds = Array.isArray(deleteFileIds) 
      ? deleteFileIds.map(Number) 
      : [Number(deleteFileIds)];
  }

  // 4. Ensure userId is a number if it was provided in the update
  if (updateDto.userId) {
    updateDto.userId = Number(updateDto.userId);
  }

  return this.tasksService.update(+id, updateDto, files || [], deleteIds);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
