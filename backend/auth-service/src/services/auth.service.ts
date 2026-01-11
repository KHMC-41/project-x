import { PrismaClient } from '@prisma/client';
import { SignUpInput, SignInInput, AuthResult } from '../types/auth.types.js';

export interface AuthServiceDeps {
  prisma: PrismaClient;
  hashPassword: (password: string) => Promise<string>;
  comparePassword: (password: string, hash: string) => Promise<boolean>;
  signToken: (payload: { sub: string; email: string }) => string;
}

export interface AuthService {
  signUp(input: SignUpInput): Promise<AuthResult>;
  signIn(input: SignInInput): Promise<AuthResult>;
}

export function createAuthService(deps: AuthServiceDeps): AuthService {
  return {
    async signUp(input: SignUpInput): Promise<AuthResult> {
      const existing = await deps.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new Error('User with this email already exists');
      }

      const passwordHash = await deps.hashPassword(input.password);

      const user = await deps.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
        },
      });

      const token = deps.signToken({ sub: user.id, email: user.email });

      return {
        token,
        user: { id: user.id, email: user.email },
      };
    },

    async signIn(input: SignInInput): Promise<AuthResult> {
      const user = await deps.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await deps.comparePassword(input.password, user.passwordHash);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      await deps.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const token = deps.signToken({ sub: user.id, email: user.email });

      return {
        token,
        user: { id: user.id, email: user.email },
      };
    },
  };
}
