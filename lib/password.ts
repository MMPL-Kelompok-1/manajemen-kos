import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  if (!stored) return Promise.resolve(false);
  return bcrypt.compare(password, stored);
}
