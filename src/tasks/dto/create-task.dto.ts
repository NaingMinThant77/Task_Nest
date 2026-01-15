/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Status } from 'src/generated/prisma';

export class CreateTaskDto {
    @IsString()
    @MinLength(4, {message: "The name is too short"})
    @IsNotEmpty({message: "The name is required"})
    name: string;

    @IsString()
    @MinLength(10, {message: "The description is too short"})
    @IsNotEmpty({message: "The description is required"})
    description: string;

    @IsEnum(Status)
    status: Status;
}