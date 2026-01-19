// import { IsEmail, IsInt, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

// export class CreateUserDto {
//     @IsInt()
//     roleId: number;

//     @IsString()
//     @MinLength(4)
//     @IsNotEmpty({message: "The name is required"})
//     name: string;

//     @IsEmail()
//     @IsNotEmpty({message: "The email is required"})
//     @MinLength(4, {message: "The email is too short"})
//     email: string;

//     @IsString()
//     @MinLength(4, {message: "The password is too short"})
//     @IsNotEmpty({message: "The password is required"})
//     @Matches(/(?=.*[a-z])/, {message: "At least one lowercase letter is required"})
//     @Matches(/(?=.*[A-Z])/, {message: "At least one uppercase letter is required"})
//     @Matches(/(?=.*[0-9])/, {message: "At least one number is required"})
//     @Matches(/(?=.*[!@#$%^&*])/, {message: "At least one special character is required"})
//     password: string;
// }

import * as yup from 'yup';

// 1. Define the core validation rules
export const CreateUserSchema = yup.object({
  name: yup.string().min(4, "The name must be at least 4 characters").required(),
  email: yup.string().email("Invalid email format").required(),
  password: yup.string()
    .min(4, "The password is too short")
    .matches(/[a-z]/, "At least one lowercase letter is required")
    .matches(/[A-Z]/, "At least one uppercase letter is required")
    .matches(/[0-9]/, "At least one number is required")
    .matches(/[!@#$%^&*]/, "At least one special character is required")
    .required(),
});

// 2. Derive the Update Schema (all fields optional)
// This is the equivalent of PartialType() in NestJS
export const UpdateUserSchema = CreateUserSchema.partial();

export const LoginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

// 3. Export Types for TypeScript
export type CreateUserDto = yup.InferType<typeof CreateUserSchema>;
export type UpdateUserDto = yup.InferType<typeof UpdateUserSchema>;
export type LoginDto = yup.InferType<typeof LoginSchema>;
