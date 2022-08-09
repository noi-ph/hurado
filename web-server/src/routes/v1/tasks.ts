import { Router } from 'express';

import { create, edit, show } from 'controllers/tasks';
import { checkJwt } from 'middleware/checkJwt';
import { validatorAccess } from 'middleware/validation/tasks';

const router = Router();

router.post('/', [checkJwt], create);
router.patch('/:id[0-9]+', [checkJwt, validatorAccess], edit);
router.get('/:id[0-9]+/show', [checkJwt, validatorAccess], show);

export default router;
