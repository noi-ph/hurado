type Error = {
  raw?: any;
}

export type UserError = Error & {
  email?: string;
  username?: string;
  password?: string;
  passwordConfirm?: string;
};

export type TaskError = Error & {
  slug?: string;
};

export type PossibleErrors = UserError | TaskError;