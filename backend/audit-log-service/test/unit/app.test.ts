import { expect } from 'chai';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('App', () => {
  describe('GET /ping', () => {
    it('should return pong', async () => {
      const app = createApp();
      const response = await request(app).get('/ping');

      expect(response.status).to.equal(200);
      expect(response.text).to.equal('pong');
    });
  });

  describe('createApp', () => {
    it('should return an express application', () => {
      const app = createApp();

      expect(app).to.have.property('listen');
      expect(app).to.have.property('use');
      expect(app).to.have.property('get');
    });
  });
});
