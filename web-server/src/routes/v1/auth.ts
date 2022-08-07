import { Router } from 'express';

import { login, register, changePassword, changeGeneral } from 'controllers/auth';
import { checkJwt } from 'middleware/checkJwt';
import { validatorLogin, validatorRegister, validatorChangePassword } from 'middleware/validation/auth';

const router = Router();

router.post('/login', [validatorLogin], login);
router.post('/register', [validatorRegister], register);
router.post('/change-password', [checkJwt, validatorChangePassword], changePassword);
router.post('/change', changeGeneral);

export default router;
