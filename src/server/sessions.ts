import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { SessionData } from "common/types/auth";
import { JWT_EXPIRE, JWT_SECRET } from "server/secrets";

export class InvalidSessionException extends Error {}

export const tokenizeSession = (load: SessionData) => {
  return jwt.sign(load, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const getSession = (request: NextRequest): SessionData => {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    throw new InvalidSessionException();
  }

  try {
    return jwt.verify(token, JWT_SECRET) as SessionData;
  } catch (e) {
    if (e instanceof Error) {
      throw new InvalidSessionException((e as Error).message);
    } else {
      throw new InvalidSessionException();
    }
  }
};
