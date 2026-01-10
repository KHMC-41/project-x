import { Request, Response } from 'express';

export function pingAction(_req: Request, res: Response): void {
  res.send('pong');
}
