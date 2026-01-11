import bcrypt from 'bcrypt';
import { prisma } from '../database/client.js';
import { signToken } from './jwt.service.js';
import { createAuthService } from './auth.service.js';

const SALT_ROUNDS = 10;

export const authService = createAuthService({
  prisma,
  hashPassword: (password) => bcrypt.hash(password, SALT_ROUNDS),
  comparePassword: (password, hash) => bcrypt.compare(password, hash),
  signToken,
});

export { signToken, verifyToken } from './jwt.service.js';
