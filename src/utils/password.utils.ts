import { compare, hash } from 'bcrypt';

export async function createHashedPassword(password: string): Promise<string> {
  const saltOrRounds = 10;

  return hash(password, saltOrRounds);
}

export async function validatePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(password, hashedPassword);
}
