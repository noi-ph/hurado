import { Countries } from '../orm/entities/users/types';

export type JwtPayload = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  country: Countries;
  createdAt: Date;
};
