import { Request, Response } from 'express';
import { prisma } from '../../database/client.js';

export async function healthDbAction(_req: Request, res: Response): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
}
