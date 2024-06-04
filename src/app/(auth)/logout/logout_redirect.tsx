"use client";

import { FunctionComponent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionWithUpdate } from "client/sessions";
import http from "client/http";

export const LogoutRedirect: FunctionComponent = () => {
  const { setSession } = useSessionWithUpdate();
  const router = useRouter();

  useEffect(() => {
    http.delete("/api/v1/auth/logout").then(() => {
      setSession(null);
      router.push("/login");
    });
  });

  return null;
};
