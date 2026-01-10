import express from 'express';

const app = express();
app.get('/ping', (_, res) => res.send('pong'));
app.listen(3001, () => console.log('auth-service:3001'));
