import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
	@IsString()
	@Length(3, 16)
	username: string;

	@Length(4, 16)
	password: string;

	@IsEmail()
	email: string;
}
