export type User = {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  isAdmin: boolean;
  school: string;
  firstName: string;
  lastName: string;
  country: string;
  updatedAt: Date;
};
export enum UserConstants {
  CURRENT = 'currentUserJson',
  JWT = 'currentUserJwt',
}
