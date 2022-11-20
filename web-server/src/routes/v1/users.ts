import { Router } from 'express';

import { edit, login, register, show } from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { validationEdit, validationLogin, validationRegister, validationShow } from 'middleware/validation/users';

const router = Router();
router.put('/login', [validationLogin], login);
router.post('/register', [validationRegister], register);
router.patch('/:id([0-9A-Za-z-]+)', [checkJwt(true), validationEdit], edit);
router.get('/:id([0-9A-Za-z-]+)/all-details', [checkJwt(true), validationShow], show(true));
router.get('/:id([0-9A-Za-z-]+)', [checkJwt(false)], show(false));

export default router;
