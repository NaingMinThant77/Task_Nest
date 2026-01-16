// /* eslint-disable @typescript-eslint/no-unsafe-return */
// import { Type } from "class-transformer";
// import { IsEnum, IsString, MinLength, ValidateNested } from "class-validator";
// import { Action, Resource } from "@prisma/client";

// export class CreateRoleDto {
//     @IsString()
//     @MinLength(3, {message: "The name is too short"})
//     name: string;

//     @ValidateNested()
//     @Type(() => Permission)
//     permission: Permission[]
// }

// export class Permission {
//     @IsEnum(Resource)
//     resource: Resource;

//     @IsEnum(Action, {each: true})
//     actions: Action[]
// }

import * as yup from 'yup';
import { Action, Resource } from '@prisma/client';

// 1. Define the Permission Schema first
export const PermissionSchema = yup.object({
  resource: yup.mixed<Resource>()
    .oneOf(Object.values(Resource), "Invalid resource type")
    .required("Resource is required"),
    
  actions: yup.array()
    .of(yup.mixed<Action>().oneOf(Object.values(Action)))
    .min(1, "At least one action is required")
    .required("Actions are required"),
});

// 2. Define the Role Schema using the Permission Schema
export const CreateRoleSchema = yup.object({
  name: yup.string()
    .min(3, "The name is too short")
    .required("Role name is required"),
    
  permission: yup.array()
    .of(PermissionSchema) // Nested validation happens here
    .min(1, "At least one permission set is required")
    .required(),
});

// 3. Export Types
export type CreateRoleDto = yup.InferType<typeof CreateRoleSchema>;
export const UpdateRoleSchema = CreateRoleSchema.partial();
export type UpdateRoleDto = yup.InferType<typeof UpdateRoleSchema>;
