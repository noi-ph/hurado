import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";
import { User } from "db/types";

type ServerPayload = {
  user: User;
};

export const tokenize = (load: ServerPayload) =>
  jwt.sign(load, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE!,
  });

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({}, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as ServerPayload;
    const payload = { user: decoded.user };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenize(payload)}`,
      },
    });
  } catch (error) {}

  return NextResponse.json({}, { status: 401 });
}
