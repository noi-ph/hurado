import { Router } from 'express';

import tasks from './tasks';
import users from './users';

const router = Router();
router.use('/users', users);
router.use('/tasks', tasks);

export default router;
