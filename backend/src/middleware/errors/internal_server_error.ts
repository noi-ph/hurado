import express from 'express';

export function handleInternalServerError(
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) {
  if (err instanceof Error) {
    console.error('Error Message:', err.message);
    console.error(err.stack ?? 'No stack trace available');
    res.status(500).send('Internal Server Error');
  } else {
    console.error('Unknown Error Message:', err);
    res.status(500).send('Internal Server Error');
  }
}
