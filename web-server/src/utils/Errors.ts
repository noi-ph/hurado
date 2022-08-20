type Error = {
  raw?: any;
}

export type UserError = Error & {
  id?: string;
  email?: string;
  username?: string;
  password?: string;
  passwordConfirm?: string;
  country?: string;
  show?: string;
};

export type TaskError = Error & {
  slug?: string;
};

export type PossibleErrors = UserError | TaskError;