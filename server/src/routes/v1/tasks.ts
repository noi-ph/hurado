import { Router } from 'express';
import multer from 'multer';

import { createSubmission } from 'controllers/submissions';
import { createTask, editTask, listTasks, viewTask } from 'controllers/tasks';
import { checkJwt } from 'middleware/checkJwt';
import { validationSubmission } from 'middleware/validation/submissions';
import { validationCreate, validateAccess, validationEdit, idOrSlug } from 'middleware/validation/tasks';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();
router.get('/', [checkJwt(false)], listTasks);
router.post(
  '/:idOrSlug([0-9A-Za-z-]+)',
  [checkJwt(false), upload.any(), idOrSlug, validationSubmission],
  createSubmission,
);
router.post('/', [checkJwt(true), upload.any(), validationCreate], createTask);
router.put('/:idOrSlug([0-9A-Za-z-]+)', [checkJwt(true), upload.any(), idOrSlug, validationEdit], editTask);
router.get('/:idOrSlug([0-9A-Za-z-]+)', [checkJwt(false), idOrSlug, validateAccess(false)], viewTask(false));
router.get('/:idOrSlug([0-9A-Za-z-]+)/all-details', [checkJwt(true), idOrSlug, validateAccess(true)], viewTask(true));

export default router;
