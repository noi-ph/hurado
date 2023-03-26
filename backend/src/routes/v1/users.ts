import { Router } from 'express';

import { login, register, edit, show, sLoginPayload } from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { validateJSON } from 'middleware/validate';
import { validationLogin, validationRegister, validationEdit, validationShow } from 'middleware/validation/users';

const router = Router();
router.put('/login', validateJSON(sLoginPayload), login);
router.post('/register', [validationRegister], register);
router.patch('/:id([0-9A-Za-z-]+)', [checkJwt(true), validationEdit], edit);
router.get('/:id([0-9A-Za-z-]+)/all-details', [checkJwt(true), validationShow], show(true));
router.get('/:id([0-9A-Za-z-]+)', [checkJwt(false)], show(false));

export default router;
