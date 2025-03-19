"use client";

import { FunctionComponent, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "client/http";
import { getPath, Path } from "client/paths";
import { useSessionWithUpdate } from "client/sessions";

export const LogoutRedirect: FunctionComponent = () => {
  const { setSession } = useSessionWithUpdate();
  const router = useRouter();

  useEffect(() => {
    http.delete("/api/v1/auth/logout").then(() => {
      setSession(null);
      router.refresh();
      router.push(getPath({ kind: Path.AccountLogin }));
    });
  });

  return null;
};
