import { Router } from 'express';

import { create, view } from 'controllers/submissions/submissions';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

// TODO put validators/middleware

router.post('/', [checkJwt], create);
router.get('/:id([0-9]+)', [], view);

export default router;