import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import { upload } from 'controllers/files';

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

router.post('/', [uploadTo.any()], upload);

export default router;
