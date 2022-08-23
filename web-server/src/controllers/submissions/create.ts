import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "orm/data-source";
import { File } from "orm/entities/files/File";
import { Submission } from "orm/entities/submissions/Submission";
import { SubmissionFile } from "orm/entities/submissions/SubmissionFile";
import { SubmissionPayload } from "utils/payloads";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { languageCode, taskId } = req.body as SubmissionPayload;
  const submission = new Submission(req.jwtPayload.id, taskId, languageCode);
  const submissionFiles: SubmissionFile[] = [];
  const files: File[] = [];
  for (let i = 0; i < req.files.length; i++) {
    const rawFile: Express.Multer.File = req.files[i];
    const file = new File(rawFile.originalname, rawFile.path);
    const submissionFile = new SubmissionFile(file, submission);

    submissionFiles.push(submissionFile);
    files.push(file);
  }

  await AppDataSource.manager.transaction(async (transaction) => {
    await transaction.save(submission);
    await transaction.save(files);
    await transaction.save(submissionFiles);
  })

  res.status(200).send(submissionFiles);
}