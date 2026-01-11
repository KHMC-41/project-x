import { Router } from 'express';
import { pingAction } from '../actions/v0/ping.action.js';
import { healthDbAction } from '../actions/v0/health-db.action.js';
import { signUpAction } from '../actions/v0/sign-up.action.js';
import { signInAction } from '../actions/v0/sign-in.action.js';
import { meAction } from '../actions/v0/me.action.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/ping', pingAction);
router.get('/health/db', healthDbAction);

router.post('/auth/sign-up', signUpAction);
router.post('/auth/sign-in', signInAction);
router.get('/auth/me', authMiddleware, (req, res) => meAction(req as AuthenticatedRequest, res));

export default router;
