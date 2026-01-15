/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Type } from "class-transformer";
import { IsEnum, IsString, MinLength, ValidateNested } from "class-validator";
import { Action, Resource } from "src/generated/prisma";

export class CreateRoleDto {
    @IsString()
    @MinLength(3, {message: "The name is too short"})
    name: string;

    @ValidateNested()
    @Type(() => Permission)
    permission: Permission[]
}

export class Permission {
    @IsEnum(Resource)
    resource: Resource;

    @IsEnum(Action, {each: true})
    actions: Action[]
}
