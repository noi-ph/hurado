import { Router } from 'express';

import { show, edit, destroy } from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { validatorEdit } from 'middleware/validation/users';

const router = Router();

router.get('/:id([0-9]+)', [checkJwt], show);

router.patch('/:id([0-9]+)', [checkJwt, validatorEdit], edit);

router.delete('/:id([0-9]+)', [checkJwt], destroy);

export default router;
