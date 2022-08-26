import { Router } from "express";

import { checkJwt } from "middleware/checkJwt";
import { validationSubmission } from "middleware/validation/submissions";
import { validationCreate, validateAccess } from "middleware/validation/tasks";
import { createSubmission } from "controllers/submissions";
import { createTask, editTask, listTasks, viewTask } from "controllers/tasks";

const router = Router();
router.post('/:id([0-9]+)', [checkJwt(false), validationSubmission], createSubmission);
router.put('/', [checkJwt(true), validationCreate], createTask);
router.put('/:id([0-9]+)', [checkJwt(true), validationCreate], editTask);
router.get('/', [checkJwt(false)], listTasks);
router.get('/:id([0-9]+)', [checkJwt(false), validateAccess(false)], viewTask(false));
router.get('/:id([0-9]+)/all-details', [checkJwt(true), validateAccess(true)], viewTask(true));

export default router;