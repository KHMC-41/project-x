import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';

describe('AuthMiddleware', () => {
  let authMiddleware: typeof import('../../../src/middleware/auth.middleware.js').authMiddleware;
  let signToken: typeof import('../../../src/services/jwt.service.js').signToken;

  before(async () => {
    sinon.stub(process, 'env').value({
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h',
    });

    const middleware = await import('../../../src/middleware/auth.middleware.js');
    authMiddleware = middleware.authMiddleware;

    const jwtService = await import('../../../src/services/jwt.service.js');
    signToken = jwtService.signToken;
  });

  after(() => {
    sinon.restore();
  });

  function createMockRequest(headers: Record<string, string> = {}): Partial<Request> {
    return { headers };
  }

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

  describe('authMiddleware', () => {
    it('should call next() for valid token', () => {
      const token = signToken({ sub: 'user-id', email: 'test@example.com' });
      const req = createMockRequest({ authorization: `Bearer ${token}` });
      const res = createMockResponse();
      const next = sinon.stub();

      authMiddleware(req as Request, res as Response, next);

      expect(next.calledOnce).to.be.true;
      expect((req as Record<string, unknown>).user).to.deep.include({
        sub: 'user-id',
        email: 'test@example.com',
      });
    });

    it('should return 401 when no authorization header', () => {
      const req = createMockRequest({});
      const res = createMockResponse();
      const next = sinon.stub();

      authMiddleware(req as Request, res as Response, next);

      expect(res.statusCode).to.equal(401);
      expect(res.jsonData).to.deep.equal({ error: 'Missing or invalid authorization header' });
      expect(next.called).to.be.false;
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      const req = createMockRequest({ authorization: 'Basic sometoken' });
      const res = createMockResponse();
      const next = sinon.stub();

      authMiddleware(req as Request, res as Response, next);

      expect(res.statusCode).to.equal(401);
      expect(res.jsonData).to.deep.equal({ error: 'Missing or invalid authorization header' });
      expect(next.called).to.be.false;
    });

    it('should return 401 for invalid token', () => {
      const req = createMockRequest({ authorization: 'Bearer invalid-token' });
      const res = createMockResponse();
      const next = sinon.stub();

      authMiddleware(req as Request, res as Response, next);

      expect(res.statusCode).to.equal(401);
      expect(res.jsonData).to.deep.equal({ error: 'Invalid or expired token' });
      expect(next.called).to.be.false;
    });

    it('should return 401 for expired token', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { sub: 'user-id', email: 'test@example.com' },
        'test-secret-key',
        { expiresIn: '-1s' },
      );
      const req = createMockRequest({ authorization: `Bearer ${expiredToken}` });
      const res = createMockResponse();
      const next = sinon.stub();

      authMiddleware(req as Request, res as Response, next);

      expect(res.statusCode).to.equal(401);
      expect(res.jsonData).to.deep.equal({ error: 'Invalid or expired token' });
      expect(next.called).to.be.false;
    });
  });
});
