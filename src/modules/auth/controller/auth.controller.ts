import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/auth.decorator';
import { CreateUserDTO } from 'src/modules/user/dtos/create-user.dto';
import { DataBaseInterceptorDecorator } from 'src/shared/decorators/database-interceptor.decorator';

import { LoginDTO } from '../dtos/login.dto';
import { AccessDTO } from '../dtos/access.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async signIn(@Body() signInDto: LoginDTO): Promise<AccessDTO> {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @DataBaseInterceptorDecorator()
  @Post('register')
  async registerAndLogin(
    @Body() registerDTO: CreateUserDTO,
  ): Promise<AccessDTO> {
    return this.authService.registerAndLogin(registerDTO);
  }

  @DataBaseInterceptorDecorator()
  @Public()
  @Post('refresh/:refresh_token')
  refresh(@Param('refresh_token') refresh_token: string) {
    return this.authService.refreshAccessToken(refresh_token);
  }
}
