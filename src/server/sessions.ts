import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "db";
import { SessionData } from "common/types/auth";
import { JWT_EXPIRE, JWT_SECRET } from "server/secrets";
import { USER_PUBLIC_FIELDS } from "common/types";

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

const getSessionUncached = async (request?: NextRequest): Promise<SessionData | null> => {
  if (request == null) {
    const token = cookies().get("session")?.value;
    return getSessionFromToken(token);
  } else if (request.headers.get("Kompgen-Token") != undefined) {
    const user = await db
      .selectFrom("users")
      .where("users.kompgen_token", "=", request.headers.get("Kompgen-Token"))
      .select(USER_PUBLIC_FIELDS)
      .executeTakeFirst();

    if (user == undefined) {
      return null;
    } else {
      return {
        user,
      };
    }
  } else {
    const token = request.cookies.get("session")?.value;
    return getSessionFromToken(token);
  }
};

export const getSession = cache(getSessionUncached);
