import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const DECODED_TOKEN_KEY = 'decoded_token';

/**
 * Get the decoded token from the http context.
 */
export const DecodedToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const decoded_token = context.switchToHttp().getRequest()[
      DECODED_TOKEN_KEY
    ];

    return decoded_token;
  },
);
