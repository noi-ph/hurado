import multer from 'multer';
import path from 'path';

import { create } from 'controllers/submissions/create';
import { Router } from 'express';
import { checkJwt } from 'middleware/checkJwt';
import { validateSubmission } from 'middleware/validation/submissions/validatorSubmission';

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

// TODO add validation

router.put('/', [uploadTo.any(), checkJwt, validateSubmission], create);

export default router;
