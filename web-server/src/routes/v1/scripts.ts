import { Router } from 'express';

import { create } from 'controllers/scripts';

const router = Router();

router.post('/', [], create);

export default router;
