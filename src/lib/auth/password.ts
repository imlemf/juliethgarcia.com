import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  // Use sync version for Edge Runtime compatibility (no setImmediate)
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Use sync version for Edge Runtime compatibility (no setImmediate)
  return bcrypt.compareSync(password, hashedPassword);
}
