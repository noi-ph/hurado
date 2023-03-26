import fs from 'fs';

import { Router } from 'express';
import jsyaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

import page404 from './pages/404';
import pageRoot from './pages/root';
import v1 from './v1';

const spec = fs.readFileSync('src/types/openapi.yaml', 'utf8');
const swaggerDocument = jsyaml.load(spec);

const router = Router();

router.use(`/v1`, v1);

router.use(`/doc`, swaggerUi.serve);
router.get(`/doc`, swaggerUi.setup(swaggerDocument));

router.use(pageRoot);
router.use(page404);

export default router;
