import { Router } from "express";

import { checkJwt } from "middleware/checkJwt";
import { validationSubmission } from "middleware/validation/submissions";
import { validationCreate } from "middleware/validation/tasks";
import { createSubmission } from "controllers/submissions";
import { createTask, editTask } from "controllers/tasks";

const router = Router();
router.post('/:id([0-9]+)', [checkJwt(false), validationSubmission], createSubmission);
router.put('/', [checkJwt(true), validationCreate], createTask);
router.put('/:id([0-9]+)', [checkJwt(true), validationCreate], editTask);

export default router;