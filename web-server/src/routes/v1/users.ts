import { Router } from 'express';

import { list, show, edit, destroy } from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorEdit } from 'middleware/validation/users';

const router = Router();

router.get('/', [checkJwt, checkRole()], list);

router.get('/:id([0-9]+)', [checkJwt], show);

router.patch('/:id([0-9]+)', [checkJwt, validatorEdit], edit);

router.delete('/:id([0-9]+)', [checkJwt], destroy);

export default router;
