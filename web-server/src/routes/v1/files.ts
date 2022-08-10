import { Router } from 'express';
import multer from 'multer';

import { upload } from 'controllers/files';

const router = Router();

const uploadTo = multer({ dest: 'uploads' });

router.post('/upload', [uploadTo.any()], upload);

export default router;
