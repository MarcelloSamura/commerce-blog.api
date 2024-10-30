/* eslint-disable @typescript-eslint/ban-types */
import type { IPaginationOptions } from 'nestjs-typeorm-paginate';

import type { EnvType } from 'src/config/env.config';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType {}
  }

  export type DeepPartial<T> = T extends Function
    ? T
    : T extends Array<infer InferredArrayMember>
      ? DeepPartialArray<InferredArrayMember>
      : T extends object
        ? DeepPartialObject<T>
        : Maybe<T>;

  export type DeepPartialObject<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
  };

  export interface DeepPartialArray<T> extends Array<DeepPartial<T>> {}

  export type NullableValue<T> = T | null;

  export type Maybe<T> = NullableValue<T> | undefined;

  export type CountHandler = readonly 'increment' | 'decrement';

  export interface IJwtPayload {
    id: string;
  }

  export type DecodedTokenType = IJwtPayload & {
    iat: number;
    exp: number;
    aud: string;
    iss: string;
  };

  export type PaginationArgs<T extends Record<string, any> = object> = T &
    Omit<IPaginationOptions, 'limit' | 'page'> & {
      limit: number;
      page: number;
    };
}
