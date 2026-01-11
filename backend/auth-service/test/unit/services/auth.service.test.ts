import { expect } from 'chai';
import sinon from 'sinon';
import { createAuthService, AuthServiceDeps } from '../../../src/services/auth.service.js';

describe('AuthService', () => {
  function createMockDeps(overrides: Partial<AuthServiceDeps> = {}): AuthServiceDeps {
    return {
      prisma: {
        user: {
          findUnique: sinon.stub().resolves(null),
          create: sinon.stub().resolves({ id: 'user-id', email: 'test@example.com', passwordHash: 'hashed' }),
          update: sinon.stub().resolves({}),
        },
      } as unknown as AuthServiceDeps['prisma'],
      hashPassword: sinon.stub().resolves('hashed-password'),
      comparePassword: sinon.stub().resolves(true),
      signToken: sinon.stub().returns('jwt-token'),
      ...overrides,
    };
  }

  describe('signUp', () => {
    it('should create a new user and return token', async () => {
      const deps = createMockDeps();
      const service = createAuthService(deps);

      const result = await service.signUp({ email: 'new@example.com', password: 'password123' });

      expect(result.token).to.equal('jwt-token');
      expect(result.user.id).to.equal('user-id');
      expect(result.user.email).to.equal('test@example.com');
    });

    it('should call hashPassword with the input password', async () => {
      const hashPassword = sinon.stub().resolves('hashed');
      const deps = createMockDeps({ hashPassword });
      const service = createAuthService(deps);

      await service.signUp({ email: 'test@example.com', password: 'mypassword' });

      expect(hashPassword.calledOnceWith('mypassword')).to.be.true;
    });

    it('should call prisma.user.create with email and hashed password', async () => {
      const deps = createMockDeps();
      const service = createAuthService(deps);

      await service.signUp({ email: 'test@example.com', password: 'password' });

      const createStub = deps.prisma.user.create as sinon.SinonStub;
      expect(createStub.calledOnce).to.be.true;
      expect(createStub.firstCall.args[0].data.email).to.equal('test@example.com');
      expect(createStub.firstCall.args[0].data.passwordHash).to.equal('hashed-password');
    });

    it('should call signToken with user id and email', async () => {
      const signToken = sinon.stub().returns('token');
      const deps = createMockDeps({ signToken });
      const service = createAuthService(deps);

      await service.signUp({ email: 'test@example.com', password: 'password' });

      expect(signToken.calledOnceWith({ sub: 'user-id', email: 'test@example.com' })).to.be.true;
    });

    it('should throw error if user already exists', async () => {
      const deps = createMockDeps();
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves({ id: 'existing', email: 'existing@example.com' });
      const service = createAuthService(deps);

      try {
        await service.signUp({ email: 'existing@example.com', password: 'password' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.equal('User with this email already exists');
      }
    });

    it('should not call create if user exists', async () => {
      const deps = createMockDeps();
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves({ id: 'existing', email: 'existing@example.com' });
      const service = createAuthService(deps);

      try {
        await service.signUp({ email: 'existing@example.com', password: 'password' });
      } catch {
        // expected
      }

      expect((deps.prisma.user.create as sinon.SinonStub).called).to.be.false;
    });
  });

  describe('signIn', () => {
    it('should return token for valid credentials', async () => {
      const deps = createMockDeps();
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: 'hashed',
      });
      const service = createAuthService(deps);

      const result = await service.signIn({ email: 'user@example.com', password: 'correctpassword' });

      expect(result.token).to.equal('jwt-token');
      expect(result.user.id).to.equal('user-id');
      expect(result.user.email).to.equal('user@example.com');
    });

    it('should call comparePassword with input password and stored hash', async () => {
      const comparePassword = sinon.stub().resolves(true);
      const deps = createMockDeps({ comparePassword });
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: 'stored-hash',
      });
      const service = createAuthService(deps);

      await service.signIn({ email: 'user@example.com', password: 'mypassword' });

      expect(comparePassword.calledOnceWith('mypassword', 'stored-hash')).to.be.true;
    });

    it('should update lastLoginAt on successful login', async () => {
      const deps = createMockDeps();
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: 'hashed',
      });
      const service = createAuthService(deps);

      await service.signIn({ email: 'user@example.com', password: 'password' });

      const updateStub = deps.prisma.user.update as sinon.SinonStub;
      expect(updateStub.calledOnce).to.be.true;
      expect(updateStub.firstCall.args[0].where.id).to.equal('user-id');
      expect(updateStub.firstCall.args[0].data.lastLoginAt).to.be.instanceOf(Date);
    });

    it('should throw error for non-existent user', async () => {
      const deps = createMockDeps();
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves(null);
      const service = createAuthService(deps);

      try {
        await service.signIn({ email: 'nonexistent@example.com', password: 'password' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.equal('Invalid email or password');
      }
    });

    it('should throw error for wrong password', async () => {
      const deps = createMockDeps();
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: 'hashed',
      });
      (deps.comparePassword as sinon.SinonStub).resolves(false);
      const service = createAuthService(deps);

      try {
        await service.signIn({ email: 'user@example.com', password: 'wrongpassword' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.equal('Invalid email or password');
      }
    });

    it('should not update lastLoginAt on failed login', async () => {
      const deps = createMockDeps();
      (deps.prisma.user.findUnique as sinon.SinonStub).resolves({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: 'hashed',
      });
      (deps.comparePassword as sinon.SinonStub).resolves(false);
      const service = createAuthService(deps);

      try {
        await service.signIn({ email: 'user@example.com', password: 'wrongpassword' });
      } catch {
        // expected
      }

      expect((deps.prisma.user.update as sinon.SinonStub).called).to.be.false;
    });
  });
});
