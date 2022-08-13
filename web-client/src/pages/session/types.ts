export type User = {
  id: number | string;
  email: string;
  username: string;
  createdAt?: Date;
  isAdmin?: boolean;
  school?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  updatedAt?: Date;
};

export enum UserConstants {
  Current = 'currentUserJson',
  JWT = 'currentUserJwt',
}
