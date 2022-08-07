import { Country } from '../orm/entities/users/types';

export type JwtPayload = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  country: Country;
  createdAt: Date;
};
