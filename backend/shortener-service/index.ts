import express from 'express';

const app = express();
app.get('/ping', (_, res) => res.send('pong'));
app.listen(3002, () => console.log('shortener-service:3002'));
