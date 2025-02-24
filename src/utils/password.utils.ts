import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function createHashedPassword(password: string): Promise<string> {
  // Generate a random salt (16 bytes is a common length)
  const salt = randomBytes(16);

  const key = (await scryptAsync(password, salt, 32)) as Buffer;

  return Buffer.concat([salt, key]).toString('base64');
}

export async function validatePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    const hashBuffer = Buffer.from(hashedPassword, 'base64');

    const salt = hashBuffer.subarray(0, 16);
    const originalHash = hashBuffer.subarray(16);

    const newHash = (await scryptAsync(password, salt, 32)) as Buffer;

    return newHash.equals(originalHash);
  } catch (error) {
    return false;
  }
}
