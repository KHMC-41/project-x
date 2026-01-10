import express, { Application } from 'express';
import routes from './routes/index.js';

export function createApp(): Application {
  const app = express();

  app.use(express.json());

  app.get('/ping', (_, res) => res.send('pong'));

  app.use('/api', routes);

  return app;
}
