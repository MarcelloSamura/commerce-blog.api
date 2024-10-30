import { Param, ParseIntPipe } from '@nestjs/common';

/**
 * A param decorator that validates whether was passed a actual number.
 * @param param the param name that you want to validate.
 * @returns A decorator function to get the validated number.
 */
export function NumberParam<T extends string>(param: T) {
  return Param(param, ParseIntPipe);
}
