import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import { upload, create } from 'controllers/files';

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

router.put('/', [], create)
router.post('/', [uploadTo.any(), (req, res, next) => {console.log('i am middleware!'); console.log(req.body); return next()}], upload);

export default router;
