import { create as createFile } from "controllers/files";
import { create as createSubmission } from "../submissions/create";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "orm/data-source";
import { SubmissionFile } from "orm/entities/submissions/SubmissionFile";

import { SubmissionFilePayload } from "utils/payloads";

export const createSubmissionFile = async (req: Request, res: Response, next: NextFunction) => {
  const { submission: rawSubmission, file: rawFile } = req.body as SubmissionFilePayload;

  const file = await createFile(rawFile.file);
  const submission = await createSubmission(rawSubmission, req.jwtPayload.id);

  const submissionFileRepository = AppDataSource.getRepository(SubmissionFile);
  const submissionFile = new SubmissionFile();
  submissionFile.file = file;
  submissionFile.submission = submission;
  await submissionFileRepository.save(submissionFile);

  res.status(200).send(submissionFile);
}