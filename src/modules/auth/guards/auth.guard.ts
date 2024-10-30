import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { LogService } from 'src/lib/log/log.service';
import { accessTokenConfig } from 'src/config/jwt.config';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/auth.decorator';
import { DECODED_TOKEN_KEY } from 'src/shared/decorators/decoded-token.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private logService: LogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token && !isPublic) {
      this.logService.logger?.warn('Token is required to access this route');

      throw new UnauthorizedException();
    }

    try {
      if (token) {
        const payload = await this.jwtService.verifyAsync(
          token,
          accessTokenConfig,
        );

        request[DECODED_TOKEN_KEY] = payload;
      }

      return true;
    } catch (error) {
      request[DECODED_TOKEN_KEY] = undefined;

      this.logService.logger?.error('Invalid token', error.stack);
      throw new UnauthorizedException('Invalid Token!');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
