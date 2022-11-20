import fs from 'fs';

import { Router } from 'express';
import jsyaml from 'js-yaml';
import swaggerUi, { JsonObject } from 'swagger-ui-express';

import page404 from './pages/404';
import pageRoot from './pages/root';
import v1 from './v1';

const router = Router();

router.use('/v1', v1);

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(jsyaml.load(fs.readFileSync('src/types/openapi.yaml', 'utf8')) as JsonObject));

router.use(pageRoot);
router.use(page404);

export default router;
