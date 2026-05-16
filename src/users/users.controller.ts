import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { DeleteUserDTO } from './dto/delete-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserDTO } from 'src/auth/dto/user.dto';
import { PatchUserDTO } from './dto/patch-user.dto';
import { PasswordConfirmGuard } from 'src/guards/password-confirm.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, PasswordConfirmGuard)
  @Patch("patch")
  changeData(@Body() DTO: PatchUserDTO, @Request() req): Promise<UserDTO> {
    return this.usersService.patchData(DTO, req.user?.id);
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  delete(@Body() DTO: DeleteUserDTO) {
    return this.usersService.deleteUser(DTO);
  }
}
