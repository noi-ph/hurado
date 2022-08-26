import { TaskConstants } from "consts/Task";
import { ServerAPI } from "types";

export const validateSlug = (slug: string) => {
  const err: ServerAPI['TaskError'] = {};

  if (!slug.match(TaskConstants.allowedCharacters)) {
    err.slug = 'Slug has invalid characters';
  } else if (slug.match(TaskConstants.hasDoubleSymbols)) {
    err.slug = 'Slug has double symbols';
  } else if (!slug.match(TaskConstants.hasAlphanumeric)) {
    err.slug = 'Slug must have an alphanumeric character';
  }

  return err;
};
