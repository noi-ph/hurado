import { Request, Response, NextFunction } from "express";

import { ServerAPI } from "types";
import { AppDataSource } from "orm/data-source";
import { Contest, File, Submission, SubmissionFile, Task, User } from "orm/entities";

export const createSubmission = async (req: Request, res: Response, next: NextFunction) => {
  const { languageCode, contestId } = req.body as ServerAPI['SubmissionPayload'];
  
  const user = await AppDataSource.getRepository(User).findOne({ where: { id: req.jwtPayload.id } });
  const task = await AppDataSource.getRepository(Task).findOne({ where: { id: req.params.taskId } });
  
  const submission = new Submission(user, task, languageCode);

  if (contestId) {
    submission.contest = Promise.resolve(await AppDataSource.getRepository(Contest).findOne({ where: { id: contestId } }));
  }

  const submissionFiles: SubmissionFile[] = [];
  const files: File[] = [];

  for (let i = 0; i < req.files.length; i++) {
    const rawFile: Express.Multer.File = req.files[i];
    const file = new File(rawFile.originalname, rawFile.size, rawFile.buffer);
    const submissionFile = new SubmissionFile(file, submission)

    submissionFiles.push(submissionFile);
    files.push(file);
  }

  await AppDataSource.manager.transaction(async (transaction) => {
    await transaction.save(submission);
    await transaction.save(files);
    await transaction.save(submissionFiles);
  })

  res.status(200).end();
};
