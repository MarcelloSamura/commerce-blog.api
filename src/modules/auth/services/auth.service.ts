import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { validatePassword } from 'src/utils/password.utils';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { accessTokenConfig, refreshJwtConfig } from 'src/config/jwt.config';
import type { CreateUserPayload } from 'src/modules/user/dtos/create-user.dto';
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';

import type { AccessDTO } from '../dtos/access.dto';
import type { LoginPayload } from '../dtos/login.dto';
import type { GenerateTokensResponse } from '../dtos/generate-tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async signIn({
    password,
    user_email,
  }: LoginPayload): Promise<AccessDTO> {
    const user = await this.usersService.getUserByEmail(user_email);

    await this.validatePassword(user, password);

    const tokens = await this.generateAccessAndRefreshToken(user);

    return this.buildAccessDTO(user, tokens);
  }

  public async registerAndLogin(data: CreateUserPayload): Promise<AccessDTO> {
    const newUser = await this.usersService.createUser(data);

    const tokens = await this.generateAccessAndRefreshToken(newUser);

    return this.buildAccessDTO(newUser, tokens);
  }

  public async refreshAccessToken(refreshToken: string) {
    const data: DecodedTokenType = await this.jwtService.verifyAsync(
      refreshToken,
      refreshJwtConfig,
    );

    const user = await this.usersService.getUserById(data.id);
    const tokens = await this.generateAccessAndRefreshToken(user);

    return tokens;
  }

  private async validatePassword(user: User, password: string): Promise<void> {
    const passwordsMatch = await validatePassword(
      password,
      user.hashed_password,
    );

    if (!passwordsMatch) {
      throw new BadRequestError('Senha incorreta');
    }
  }

  private async generateAccessAndRefreshToken(
    user: User,
  ): Promise<GenerateTokensResponse> {
    const { access_token, refresh_token } = await this.getTokens({
      id: user.id,
    });

    return { access_token, refresh_token };
  }

  private buildAccessDTO(
    user: User,
    { access_token, refresh_token }: GenerateTokensResponse,
  ): AccessDTO {
    return {
      user: {
        id: user.id,
        user_name: user.user_name,
        user_email: user.user_email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth,
      },
      access_token,
      refresh_token,
    };
  }

  async getTokens(jwtPayload: IJwtPayload): Promise<GenerateTokensResponse> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, accessTokenConfig),
      this.jwtService.signAsync(jwtPayload, refreshJwtConfig),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
