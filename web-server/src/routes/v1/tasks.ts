import { Router } from 'express';

import { create, edit, list, show, view } from 'controllers/tasks';
import { checkJwt } from 'middleware/checkJwt';
import { maybeCheckJwt } from 'middleware/maybeCheckJwt';
import { validatorAccess } from 'middleware/validation/tasks';

const router = Router();

router.post('/create', [checkJwt], create);
router.patch('/:id([0-9]+)', [checkJwt, validatorAccess], edit);
router.get('/', [checkJwt], list);
router.get('/show/:id([0-9]+)', [checkJwt, validatorAccess], show);
router.get('/:id([0-9]+)', [checkJwt, validatorAccess], show);
router.get('/view/:idOrSlug([0-9A-Za-z]+)', [maybeCheckJwt], view);

export default router;
