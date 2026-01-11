import { expect } from 'chai';
import { signUpSchema, signInSchema } from '../../../src/validation/auth.schema.js';

describe('Auth Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('should pass for valid input', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.data.email).to.equal('test@example.com');
        expect(result.data.password).to.equal('password123');
      }
    });

    it('should fail for invalid email', () => {
      const result = signUpSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });

      expect(result.success).to.be.false;
      if (!result.success) {
        expect(result.error.issues[0].message).to.equal('Invalid email format');
      }
    });

    it('should fail for missing email', () => {
      const result = signUpSchema.safeParse({
        password: 'password123',
      });

      expect(result.success).to.be.false;
    });

    it('should fail for password less than 6 characters', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });

      expect(result.success).to.be.false;
      if (!result.success) {
        expect(result.error.issues[0].message).to.equal('Password must be at least 6 characters');
      }
    });

    it('should fail for missing password', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
      });

      expect(result.success).to.be.false;
    });

    it('should pass for exactly 6 character password', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result.success).to.be.true;
    });
  });

  describe('signInSchema', () => {
    it('should pass for valid input', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'any',
      });

      expect(result.success).to.be.true;
    });

    it('should fail for invalid email', () => {
      const result = signInSchema.safeParse({
        email: 'not-an-email',
        password: 'password',
      });

      expect(result.success).to.be.false;
      if (!result.success) {
        expect(result.error.issues[0].message).to.equal('Invalid email format');
      }
    });

    it('should fail for empty password', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).to.be.false;
      if (!result.success) {
        expect(result.error.issues[0].message).to.equal('Password is required');
      }
    });

    it('should pass for short password (no min length for sign-in)', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'a',
      });

      expect(result.success).to.be.true;
    });
  });
});
