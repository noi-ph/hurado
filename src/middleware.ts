import { NextRequest, NextResponse } from "next/server";

export const middleware = (request: NextRequest) => {
  // Some CSRF magic
  // See: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi
  // Counterpart: client/http.ts
  if (request.method != "GET" && request.headers.get("X-XSRF-PROTECTION") != "1") {
    return NextResponse.json({ error: "Invalid XSRF Header" }, { status: 400 });
  }

  return NextResponse.next();
};
