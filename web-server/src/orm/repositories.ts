import { AppDataSource } from './data-source';
import { Contest, File, Script, Task, User } from './entities';

export const AppDataSourceInitialization = AppDataSource.initialize();
export const UserRepository = AppDataSource.getRepository(User);
export const TaskRepository = AppDataSource.getRepository(Task);
export const FileRepository = AppDataSource.getRepository(File);
export const ScriptRepository = AppDataSource.getRepository(Script);
export const ContestRepository = AppDataSource.getRepository(Contest);
