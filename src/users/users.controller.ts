import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { type CreateUserDto, CreateUserSchema, type LoginDto, LoginSchema, type UpdateUserDto, UpdateUserSchema } from './dto/create-user.dto';
import { UseSchema } from 'src/common/decorators/use-schema.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseSchema(CreateUserSchema)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @UseSchema(LoginSchema)
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.getProfile(+id);
  }

  @Patch(':id')
  @UseSchema(UpdateUserSchema)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
