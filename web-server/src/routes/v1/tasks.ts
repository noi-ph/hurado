import { Router } from 'express';

import { create, edit, list, show, view } from 'controllers/tasks';
import { checkJwt } from 'middleware/checkJwt';
import { maybeCheckJwt } from 'middleware/maybeCheckJwt';
import { validatorAccess } from 'middleware/validation/tasks';

const router = Router();

// TODO merge show and view so that maybeCheckJwt is the only middleware needed
//      GET task/ headers: {...} -> maybeCheckJwt -> provide only necessary details
//      idOrSlug should be the default parameter for ^^^

router.post('/', [checkJwt], create);
router.patch('/:id([0-9]+)', [checkJwt, validatorAccess], edit);
router.get('/', [maybeCheckJwt], list);
router.get('/show/:id([0-9]+)', [checkJwt, validatorAccess], show);
router.get('/:id([0-9]+)', [checkJwt, validatorAccess], show);
router.get('/view/:idOrSlug([0-9A-Za-z]+)', [maybeCheckJwt], view);

export default router;
