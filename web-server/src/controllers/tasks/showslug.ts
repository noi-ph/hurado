import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const showslug = async (req: Request, res: Response, next: NextFunction) => {
    const taskSlug = req.params.idOrSlug;

    const taskRepository = AppDataSource.getRepository(Task);
    try {
        const task = await taskRepository.findOne({ where: { id: parseInt(taskSlug) } });

        if (!task) {
            const task1 = await taskRepository.findOne({ where: { slug: taskSlug } });
            if (!task1) {
                const customError = new CustomError(404, 'General', 'Task cannot be found', [`Task ${taskSlug} does not exist`]);
                return next(customError);
            }
            res.send(task1);
            res.customSuccess(200, 'Task successfully sent.');
        }

        res.send(task);
        res.customSuccess(200, 'Task successfully sent.');
    } catch (err) {
        const customError = new CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
