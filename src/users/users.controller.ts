import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { type CreateUserDto, CreateUserSchema, type LoginDto, LoginSchema, type UpdateUserDto, UpdateUserSchema } from './dto/create-user.dto';
import { UseSchema } from 'src/common/decorators/use-schema.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post() // public
  @UseSchema(CreateUserSchema)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login') // public
  @UseSchema(LoginSchema)
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Only Admin can see the full list
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) // Any logged-in user can view a profile
  findOne(@Param('id') id: string) {
    return this.usersService.getProfile(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseSchema(UpdateUserSchema)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Only Admin can delete users
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
