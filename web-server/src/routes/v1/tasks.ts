import multer from 'multer';
import path from 'path';


import { Router } from 'express';

import { edit, list, view } from 'controllers/tasks';
import { createTask as create } from 'controllers/tasks';
import { validateTaskPayload } from 'middleware/validation/tasks/validatorCreate';
import { checkJwt } from 'middleware/checkJwt';
import { maybeCheckJwt } from 'middleware/maybeCheckJwt';
import { validatorAccess } from 'middleware/validation/tasks';

const router = Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

var uploadTo = multer({ storage: storage });

router.post('/', [uploadTo.any(), checkJwt, validateTaskPayload], create);
router.patch('/:id([0-9]+)', [checkJwt, validatorAccess], edit);
router.get('/', [maybeCheckJwt], list);
router.get('/:idOrSlug([0-9A-Za-z]+)/all-details', [checkJwt, validatorAccess], view);
router.get('/:idOrSlug([0-9A-Za-z]+)', [maybeCheckJwt], view);

export default router;
