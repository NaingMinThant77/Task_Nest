import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { type CreateTaskDto, CreateTaskSchema, type UpdateTaskDto, UpdateTaskSchema } from './dto/create-task.dto';
import { UseSchema } from 'src/common/decorators/use-schema.decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { PaginationSchema, type PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard) // Everything in this controller requires login
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseSchema(CreateTaskSchema)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
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
  @UseSchema(UpdateTaskSchema)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
