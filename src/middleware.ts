import { NextRequest, NextResponse } from "next/server";

export const middleware = (request: NextRequest) => {
  const headers = new Headers(request.headers);

  headers.set("Content-Type", "application/json");
  headers.set(
    "Access-Control-Allow-Origin",
    `
      https://hurado.ncisomendoza.com,
      https://dev.hurado.ncisomendoza.com,
      localhost:10000
    `
      .trim()
      .replace(/\s+/g, " ")
  );

  return NextResponse.next({
    request: { headers },
  });
};
