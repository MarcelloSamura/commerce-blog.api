import { Logger } from '@nestjs/common';

export async function benchmark<F extends (...args: any) => Promise<any>>(
  fn: F,
  ...args: Parameters<F>
): Promise<ReturnType<F>> {
  const start = process.hrtime();

  const res = await fn(...args);

  const end = process.hrtime(start);
  const timeInMs = (end[0] * 1000) + (end[1] / 1e6);

  Logger.log(`Took ${timeInMs} ms`);

  return res;
}
