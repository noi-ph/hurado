import { Router } from 'express';

import { create, view } from 'controllers/submissions/submissions';

const router = Router();

// TODO put validators/middleware

router.post('/', [], create);
router.get('/:id([0-9]+)', [], view);

export default router;