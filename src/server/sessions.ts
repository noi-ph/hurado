import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SessionData } from "common/types/auth";
import { JWT_EXPIRE, JWT_SECRET } from "server/secrets";

export class InvalidSessionException extends Error {}

export const tokenizeSession = (load: SessionData) => {
  return jwt.sign(load, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const getSessionFromToken = (token: string | undefined): SessionData | null => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as SessionData;
  } catch (e) {
    return null;
  }
};

export const getSession = (request?: NextRequest): SessionData | null => {
  if (request != null) {
    const token = request.cookies.get("session")?.value;
    return getSessionFromToken(token);
  } else {
    const token = cookies().get("session")?.value;
    return getSessionFromToken(token);
  }
};
