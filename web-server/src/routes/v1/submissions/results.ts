import { Router } from 'express';

import { create, destroy, edit, view } from 'controllers/submissions/results';

const router = Router();

// TODO put validators/middleware

router.post('/', [], create);
router.delete('/:id([0-9]+)', [], destroy);
router.patch('/:id([0-9]+)', [], edit);
router.get('/:id([0-9]+)', [], view);

export default router;