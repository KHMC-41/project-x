import { Request, Response } from 'express';
import { signUpSchema } from '../../validation/auth.schema.js';
import { authService } from '../../services/index.js';

export async function signUpAction(req: Request, res: Response): Promise<void> {
  const parsed = signUpSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const result = await authService.signUp(parsed.data);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign up failed';
    res.status(400).json({ error: message });
  }
}
