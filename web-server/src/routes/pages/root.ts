import { Router } from 'express';

const router = Router();

router.get('/', (_req, res, _next) => {
  res.status(200).header('Content-Type', 'text/html').send('<h4>💊 RESTful API boilerplate</h4>');
});

export default router;
