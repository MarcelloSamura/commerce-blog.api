import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { DECODED_TOKEN_KEY } from './decoded-token.decorator';

/**
 * Get the logged in user id from the http context.
 */
export const LoggedInUserIdDecoratorDecorator = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const decoded_token = context.switchToHttp().getRequest()[
      DECODED_TOKEN_KEY
    ] as DecodedTokenType;

    return decoded_token.id;
  },
);