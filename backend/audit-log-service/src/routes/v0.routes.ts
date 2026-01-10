import { Router } from 'express';
import { pingAction } from '../actions/v0/ping.action.js';
import { healthDbAction } from '../actions/v0/health-db.action.js';

const router = Router();

router.get('/ping', pingAction);
router.get('/health/db', healthDbAction);

export default router;
