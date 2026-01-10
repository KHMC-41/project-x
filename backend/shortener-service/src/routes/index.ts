import { Router } from 'express';
import v0Routes from './v0.routes.js';

const router = Router();

router.use('/v0', v0Routes);

export default router;
