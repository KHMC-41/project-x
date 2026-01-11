import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';

describe('JwtService', () => {
  let signTokenFn: typeof import('../../../src/services/jwt.service.js').signToken;
  let verifyTokenFn: typeof import('../../../src/services/jwt.service.js').verifyToken;

  before(async () => {
    sinon.stub(process, 'env').value({
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h',
    });

    const jwtService = await import('../../../src/services/jwt.service.js');
    signTokenFn = jwtService.signToken;
    verifyTokenFn = jwtService.verifyToken;
  });

  after(() => {
    sinon.restore();
  });

  describe('signToken', () => {
    it('should return a valid JWT token', () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      const token = signTokenFn(payload);

      expect(token).to.be.a('string');
      expect(token.split('.')).to.have.lengthOf(3);
    });

    it('should include payload data in the token', () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      const token = signTokenFn(payload);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.sub).to.equal('user-123');
      expect(decoded.email).to.equal('test@example.com');
    });

    it('should include expiration in the token', () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      const token = signTokenFn(payload);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.exp).to.be.a('number');
      expect(decoded.iat).to.be.a('number');
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const payload = { sub: 'user-456', email: 'verify@example.com' };
      const token = signTokenFn(payload);
      const result = verifyTokenFn(token);

      expect(result.sub).to.equal('user-456');
      expect(result.email).to.equal('verify@example.com');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyTokenFn('invalid-token')).to.throw();
    });

    it('should throw error for token with wrong secret', () => {
      const token = jwt.sign({ sub: 'user', email: 'test@test.com' }, 'wrong-secret');
      expect(() => verifyTokenFn(token)).to.throw();
    });
  });
});
