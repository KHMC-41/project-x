import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { meAction } from '../../../src/actions/v0/me.action.js';
import type { AuthenticatedRequest } from '../../../src/middleware/auth.middleware.js';

describe('Auth Actions', () => {
  before(() => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  function createMockResponse(): Partial<Response> & { statusCode?: number; jsonData?: unknown } {
    const res: Partial<Response> & { statusCode?: number; jsonData?: unknown } = {};
    res.status = sinon.stub().callsFake((code: number) => {
      res.statusCode = code;
      return res as Response;
    });
    res.json = sinon.stub().callsFake((data: unknown) => {
      res.jsonData = data;
      return res as Response;
    });
    return res;
  }

  describe('meAction', () => {
    it('should return user info from JWT payload', () => {
      const req = {
        user: { sub: 'user-id', email: 'test@example.com' },
      } as AuthenticatedRequest;
      const res = createMockResponse();

      meAction(req, res as Response);

      expect(res.jsonData).to.deep.equal({
        user: { id: 'user-id', email: 'test@example.com' },
      });
    });

    it('should return different user data for different payloads', () => {
      const req = {
        user: { sub: 'another-user-456', email: 'another@example.com' },
      } as AuthenticatedRequest;
      const res = createMockResponse();

      meAction(req, res as Response);

      expect(res.jsonData).to.deep.equal({
        user: { id: 'another-user-456', email: 'another@example.com' },
      });
    });
  });
});
