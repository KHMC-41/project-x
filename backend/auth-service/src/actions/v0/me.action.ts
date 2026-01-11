import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export function meAction(req: AuthenticatedRequest, res: Response): void {
  res.json({
    user: {
      id: req.user.sub,
      email: req.user.email,
    },
  });
}
