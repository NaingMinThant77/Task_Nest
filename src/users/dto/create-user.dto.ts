import { IsEmail, IsInt, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
    @IsInt()
    roleId: number;

    @IsString()
    @MinLength(4)
    @IsNotEmpty({message: "The name is required"})
    name: string;

    @IsEmail()
    @IsNotEmpty({message: "The email is required"})
    @MinLength(4, {message: "The email is too short"})
    email: string;

    @IsString()
    @MinLength(4, {message: "The password is too short"})
    @IsNotEmpty({message: "The password is required"})
    @Matches(/(?=.*[a-z])/, {message: "At least one lowercase letter is required"})
    @Matches(/(?=.*[A-Z])/, {message: "At least one uppercase letter is required"})
    @Matches(/(?=.*[0-9])/, {message: "At least one number is required"})
    @Matches(/(?=.*[!@#$%^&*])/, {message: "At least one special character is required"})
    password: string;
}
