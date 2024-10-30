import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from 'src/modules/user/user.module';
import { ENV_VARIABLES } from 'src/config/env.config';

import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { AuthController } from './controller/auth.controller';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: ENV_VARIABLES.JWT_SECRET,
      signOptions: {
        expiresIn: ENV_VARIABLES.JWT_EXPIRES_IN,
        audience: ENV_VARIABLES.JWT_AUDIENCE,
        issuer: ENV_VARIABLES.JWT_ISSUER,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
