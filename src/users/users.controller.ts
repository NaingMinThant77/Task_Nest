/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, UseInterceptors, BadRequestException, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { type CreateUserDto, CreateUserSchema, type LoginDto, LoginSchema, type UpdateUserDto, UpdateUserSchema } from './dto/create-user.dto';
import { UseSchema } from 'src/common/decorators/use-schema.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { type PaginationDto, PaginationSchema } from 'src/common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('upload-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Save the file path to the user in the database
    return this.usersService.updateProfilePhoto(req.user.userId, file);
  }

  @Get() // http://localhost:3000/users?page=1&limit=2&search=John&id=desc
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Only Admin can see the full list
  @UseSchema(PaginationSchema)
findAll(@Query() pagination: PaginationDto) {
  return this.usersService.findAll(pagination);
}

 @UseGuards(JwtAuthGuard)
  @Get('me/profile') // MUST be above @Get(':id')
  getMe(@Request() req) {
    // In JwtStrategy we used: payload.sub
    return this.usersService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
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
