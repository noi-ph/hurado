type Error = {
  status?: any;
}

export type UserError = Error & {
  id?: string;
  email?: string;
  username?: string;
  password?: string;
  passwordConfirm?: string;
  country?: string;
};

export type TaskError = Error & {
  slug?: string;
};

export type PossibleErrors = UserError | TaskError;