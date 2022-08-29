import { Request, Response, NextFunction } from 'express';

import { TaskRepository } from 'orm/repositories';

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await TaskRepository.find({
      select: ['id', 'title', 'slug', 'description', 'isPublicInArchive'],
      where: { isPublicInArchive: true },
      relations: {
        testData: true,
        subtasks: true,
        developers: true,
        attachments: true,
      },
    });

    res.status(200).send(tasks);
  } catch (e) {
    res.status(500).end();
  }
};
