import { bootstrap } from './bootstrap.js';

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
