import { Router } from 'express';

import { create, edit, show, showslug } from 'controllers/tasks';
import { checkJwt } from 'middleware/checkJwt';
import { validatorAccess } from 'middleware/validation/tasks';

const router = Router();

router.post('/', [checkJwt], create);
router.patch('/:id([0-9]+)', [checkJwt, validatorAccess], edit);
router.get('/show/:id([0-9]+)', [checkJwt, validatorAccess], show);
router.get('/:id([0-9]+)', [checkJwt, validatorAccess], show);
router.get('/slug/:idOrSlug([0-9A-Za-z-]+)', [checkJwt, validatorAccess], showslug);

export default router;
