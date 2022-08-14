import { Router } from 'express';

import { create, destroy, view } from 'controllers/submissions/files';

const router = Router();

// TODO put validators/middleware

router.post('/', [], create);
router.delete('/:id([0-9]+)', [], destroy);
router.get('/:id([0-9]+)', [], view);

export default router;