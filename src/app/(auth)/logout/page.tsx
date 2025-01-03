"use client";

import { FunctionComponent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionWithUpdate } from "client/sessions";
import http from "client/http";

const Page: FunctionComponent = () => {
  const router = useRouter();
  const { setSession } = useSessionWithUpdate();

  useEffect(() => {
    // So annoying! Can't set cookies from Pages, And the session cookie is http-only,
    // so we can't delete it purely from the client. But we need to run this setSession
    // function from the client-side too.

    http.delete("/api/v1/auth/logout").then(() => {
      setSession(null);
      router.push("/login");
      router.refresh();
    });
  });

  return null;
};

export default Page;
