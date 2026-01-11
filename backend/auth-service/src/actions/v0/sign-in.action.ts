import { Request, Response } from 'express';
import { signInSchema } from '../../validation/auth.schema.js';
import { authService } from '../../services/index.js';

export async function signInAction(req: Request, res: Response): Promise<void> {
  const parsed = signInSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const result = await authService.signIn(parsed.data);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in failed';
    res.status(401).json({ error: message });
  }
}
