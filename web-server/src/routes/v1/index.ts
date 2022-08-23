import { Router } from 'express';

import auth from './auth';
import tasks from './tasks';
import users from './users';
import submissions from './submissions';

const router = Router();

router.use('/auth', auth);
router.use('/tasks', tasks);
router.use('/users', users);
router.use('/submissions', submissions);

export default router;
