import { IsEmail, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class LoginUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
