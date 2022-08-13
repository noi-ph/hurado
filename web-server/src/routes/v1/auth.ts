import { Router } from 'express';

import { login, register } from 'controllers/auth';
import { validatorLogin, validatorRegister } from 'middleware/validation/auth';

const router = Router();

router.post('/login', [validatorLogin], login);
router.post('/register', [validatorRegister], register);

export default router;
