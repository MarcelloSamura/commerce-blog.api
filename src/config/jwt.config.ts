import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import { ENV_VARIABLES } from './env.config';

export const accessTokenConfig = {
  secret: ENV_VARIABLES.JWT_SECRET,
  expiresIn: ENV_VARIABLES.JWT_EXPIRES_IN,
  audience: ENV_VARIABLES.JWT_AUDIENCE,
  issuer: ENV_VARIABLES.JWT_ISSUER,
} satisfies JwtSignOptions | JwtVerifyOptions;

export const refreshJwtConfig = {
  secret: ENV_VARIABLES.JWT_REFRESH_SECRET,
  expiresIn: ENV_VARIABLES.JWT_REFRESH_EXPIRES_IN,
  audience: ENV_VARIABLES.JWT_AUDIENCE,
  issuer: ENV_VARIABLES.JWT_ISSUER,
} satisfies JwtSignOptions | JwtVerifyOptions;
