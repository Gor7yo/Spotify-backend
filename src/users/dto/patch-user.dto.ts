import { IsEmail, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class PatchUserDTO {
  password: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(3, 16)
  username?: string;

  @IsOptional()
  @Length(0, 32)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
