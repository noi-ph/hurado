import * as fs from 'fs';

import { AppDataSource } from 'orm/data-source';
import { createFile, createScript } from 'orm/entities';
import { TaskType } from 'orm/entities/enums';
import { AppDataSourceInitialization, TaskRepository, UserRepository } from 'orm/repositories';

async function runSeedData() {
  await AppDataSourceInitialization;
  AppDataSource.transaction(async (transaction) => {
    const originalCWD = process.cwd();
    process.chdir(__dirname);

    const walter = UserRepository.create({
      username: 'Heisenberg',
      name: 'Walter White',
      email: 'admin@admin.com',
      isAdmin: true,
    });
    walter.setPassword('pass1');

    const jesse = UserRepository.create({
      username: 'Jesse',
      name: 'Jesse Pinkman',
      email: 'user@user.com',
      isAdmin: false,
    });
    jesse.setPassword('pass1');

    const skyler = UserRepository.create({
      username: 'Sky',
      name: 'Skyler White',
      email: 'skyler.white@test.com',
      isAdmin: false,
    });
    skyler.setPassword('pass1');

    const hank = UserRepository.create({
      username: 'Hank',
      name: 'Hank Schrader',
      email: 'hank.schrader@test.com',
      isAdmin: false,
    });
    hank.setPassword('pass1');

    const marie = UserRepository.create({
      username: 'Marie',
      name: 'Marie Schrader',
      email: 'marie.schrader@test.com',
      isAdmin: false,
    });
    marie.setPassword('pass1');

    const saul = UserRepository.create({
      username: 'The Lawyer',
      name: 'Saul Goodman',
      email: 'saul.goodman@test.com',
      isAdmin: false,
    });
    saul.setPassword('pass1');

    await transaction.save([walter, jesse, skyler, hank, marie, saul]);

    const noop = fs.readFileSync('./noop.py');

    const oldestChecker = createScript({
      file: createFile({
        name: 'oldest-checker.py',
        contents: noop,
      }),
      languageCode: 'python',
      runtimeArgs: '',
    });

    const oldestValidator = createScript({
      file: createFile({
        name: 'oldest-validator.py',
        contents: noop,
      }),
      languageCode: 'python',
      runtimeArgs: '',
    });

    const oldest = TaskRepository.create({
      owner: Promise.resolve(walter),
      title: 'Who is the oldest?',
      slug: 'who-is-the-oldest',
      taskType: TaskType.Batch,
      statement: fs.readFileSync('./who-is-the-oldest/statement.tex').toString(),
      scoreMax: 100,
      timeLimit: 2898,
      memoryLimit: 8982,
      compileTimeLimit: 1188,
      compileMemoryLimit: 8811,
      submissionSizeLimit: 9999,
      isPublicInArchive: true,
    });

    // There seems to be a TypeORM bug where assigning a child directly via
    // Repository.create doesn't properly assign object.childId
    // The workaround is to assign the child after creating. :(
    oldest.owner = Promise.resolve(walter);
    oldest.checkerScript = Promise.resolve(oldestChecker);
    oldest.validatorScript = Promise.resolve(oldestValidator);
    await transaction.save([
      await oldestChecker.file,
      oldestChecker,
      await oldestValidator.file,
      oldestValidator,
      oldest,
    ]);

    const fetchChecker = createScript({
      file: createFile({
        name: 'fetch-checker.py',
        contents: noop,
      }),
      languageCode: 'python',
      runtimeArgs: '',
    });

    const fetchValidator = createScript({
      file: createFile({
        name: 'fetch-validator.py',
        contents: noop,
      }),
      languageCode: 'python',
      runtimeArgs: '',
    });

    const fetch = TaskRepository.create({
      owner: Promise.resolve(walter),
      title: 'This Problem Is So Fetch',
      slug: 'this-problem-is-so-fetch',
      taskType: TaskType.Batch,
      statement: fs.readFileSync('./this-problem-is-so-fetch/statement.tex').toString(),
      scoreMax: 100,
      timeLimit: 2898,
      memoryLimit: 8982,
      compileTimeLimit: 1188,
      compileMemoryLimit: 8811,
      submissionSizeLimit: 9999,
      isPublicInArchive: true,
    });
    fetch.owner = Promise.resolve(walter);
    fetch.checkerScript = Promise.resolve(fetchChecker);
    fetch.validatorScript = Promise.resolve(fetchValidator);
    await transaction.save([await fetchChecker.file, fetchChecker, await fetchValidator.file, fetchValidator, fetch]);

    process.chdir(originalCWD);
  });
}

runSeedData();
