import { Router } from 'express';

import auth from './auth';
import files from './files';
import scripts from './scripts';
import tasks from './tasks';
import users from './users';
import submissions from './submissions/submissions';
import submissionFiles from './submissions/files';
import results from './submissions/results';
import subtaskResults from './submissions/subtaskResults';
import testDataResults from './submissions/testDataResults';

const router = Router();

router.use('/auth', auth);
router.use('/files', files);
router.use('/scripts', scripts);
router.use('/tasks', tasks);
router.use('/users', users);
router.use('/submissions', submissions);
router.use('/submission-files', submissionFiles);
router.use('/results', results);
router.use('/subtask-results', subtaskResults);
router.use('/test-data-results', testDataResults);

export default router;
