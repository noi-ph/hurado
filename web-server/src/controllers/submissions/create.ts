import { AppDataSource } from "orm/data-source";
import { Submission } from "orm/entities/submissions/Submission";
import { SubmissionPayload } from "utils/payloads";

export const create = async (data: SubmissionPayload, ownerId: number) => {
  const { languageCode, taskId } = data;
  const submissionRepository = AppDataSource.getRepository(Submission);
  const submission = new Submission();
  submission.languageCode = languageCode;
  submission.ownerId = ownerId;
  submission.taskId = taskId;
  await submissionRepository.save(submission);

  return submission 
}