import multer from 'multer';
import path from 'path';

import { createSubmissionFile } from 'controllers/submissionFiles/create';
import { Router } from 'express';
import { checkJwt } from 'middleware/checkJwt';
import { validateSubmissionPayload } from 'middleware/validation/submissions/validatorCreate';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

var uploadTo = multer({ storage: storage });

const router = Router();

router.put('/', [uploadTo.any(), checkJwt, validateSubmissionPayload], createSubmissionFile);

export default router;
