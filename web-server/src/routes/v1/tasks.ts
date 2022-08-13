import { Router } from 'express';

import { create, edit, list, view } from 'controllers/tasks';
import { checkJwt } from 'middleware/checkJwt';
import { maybeCheckJwt } from 'middleware/maybeCheckJwt';
import { validatorAccess } from 'middleware/validation/tasks';

const router = Router();

router.post('/', [checkJwt], create);
router.patch('/:id([0-9]+)', [checkJwt, validatorAccess], edit);
router.get('/', [maybeCheckJwt], list);
router.get('/:idOrSlug([0-9A-Za-z]+)/all-details', [checkJwt, validatorAccess], view);
router.get('/:idOrSlug([0-9A-Za-z]+)', [maybeCheckJwt], view);

export default router;
