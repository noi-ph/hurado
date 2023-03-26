import { Request, Response, NextFunction } from 'express';

import { Countries } from 'orm/entities/enums';
import { UserRepository } from 'orm/repositories';
import { ServerAPI } from 'types';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.jwtPayload.id;
  let { email, username, school, name, country, password } = req.body as ServerAPI['UserEditPayload'];
  const user = await UserRepository.findOne({ where: { id } });
  
  try {
    if (email) {
      user.email = email;
    }

    if (username) {
      user.username = username;
    }

    if (school) {
      user.school = school;
    }

    if (name) {
      user.name = name;
    }

    if (country) {
      user.country = country as Countries;
    }

    if (password) {
      user.setPassword(password);
    }

    await UserRepository.save(user);
    res.status(200).send(user);
  } catch (e) {
    res.status(500).end();
  }
};
