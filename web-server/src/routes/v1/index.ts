import { Router } from 'express';

import auth from './auth';
import files from './files';
import scripts from './scripts';
import tasks from './tasks';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/files', files);
router.use('/scripts', scripts);
router.use('/tasks', tasks);
router.use('/users', users);

export default router;
