// import { IsEnum, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
// import { Status } from '@prisma/client';

// export class CreateTaskDto {
//     @IsInt()
//     userId: number;

//     @IsString()
//     @MinLength(4, {message: "The name is too short"})
//     @IsNotEmpty({message: "The name is required"})
//     name: string;

//     @IsString()
//     @MinLength(10, {message: "The description is too short"})
//     @IsNotEmpty({message: "The description is required"})
//     description: string;

//     @IsEnum(Status)
//     status: Status;
// }

import * as yup from 'yup';
import { Status } from '@prisma/client';

export const CreateTaskSchema = yup.object({
  // Use .transform to handle strings coming from form-data
  userId: yup.number()
    .transform((value, originalValue) => {
      return originalValue === "" ? undefined : Number(value);
    })
    .integer()
    .required("User ID is required"),
    
  name: yup.string()
    .min(4, "The name must be at least 4 characters")
    .required("The name is required"),
    
  description: yup.string()
    .min(10, "The description must be at least 10 characters")
    .required("The description is required"),
    
  // Link this to your Prisma Enum
  status: yup.mixed<Status>()
    .oneOf(Object.values(Status), "Invalid status value")
    .required("Status is required"),

  deleteFileIds: yup.lazy((val) => 
    Array.isArray(val) 
      ? yup.array().of(yup.number()) 
      : yup.mixed().transform(v => v ? [Number(v)] : [])
  ).optional(),
});

// Derived types for your service and controller
export const UpdateTaskSchema = CreateTaskSchema.partial();

export type CreateTaskDto = yup.InferType<typeof CreateTaskSchema>;
export type UpdateTaskDto = yup.InferType<typeof UpdateTaskSchema>;