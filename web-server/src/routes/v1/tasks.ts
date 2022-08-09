import { Router } from 'express';

import { create, edit, show } from 'controllers/tasks';
import { checkJwt } from 'middleware/checkJwt';
import { validatorAccess } from 'middleware/validation/tasks';

const router = Router();

router.post('/', [checkJwt], create);
router.patch('/:id([0-9]+)', [checkJwt, validatorAccess], edit);
router.get('/show/:id([0-9]+)', [checkJwt, validatorAccess], show);

export default router;
