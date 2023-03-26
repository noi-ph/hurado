import { AppDataSource } from './data-source';
import { Contest, File, Script, Task, User, Participation, TestData, Subtask, TaskAttachment, TaskDeveloper } from './entities';

export const AppDataSourceInitialization = AppDataSource.initialize();
export const UserRepository = AppDataSource.getRepository(User);
export const TaskRepository = AppDataSource.getRepository(Task);
export const FileRepository = AppDataSource.getRepository(File);
export const ScriptRepository = AppDataSource.getRepository(Script);
export const ContestRepository = AppDataSource.getRepository(Contest);
export const ParticipationRepository = AppDataSource.getRepository(Participation);
export const TestDataRepository = AppDataSource.getRepository(TestData);
export const SubtaskRepository = AppDataSource.getRepository(Subtask);
export const TaskAttachmentRepository = AppDataSource.getRepository(TaskAttachment);
export const TaskDeveloperRepository = AppDataSource.getRepository(TaskDeveloper);
