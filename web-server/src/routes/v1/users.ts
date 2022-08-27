import { Router } from 'express';

import { login, register, edit, show } from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { validationLogin, validationRegister, validationEdit, validationShow } from 'middleware/validation/users';

const router = Router();
router.put('/login', [validationLogin], login);
router.post('/register', [validationRegister], register);
router.patch('/:id([0-9]+)', [checkJwt(true), validationEdit], edit);
router.get('/:id([0-9]+)/all-details', [checkJwt(true), validationShow], show(true));
router.get('/:id([0-9]+)', [checkJwt(false)], show(false));

export default router;
