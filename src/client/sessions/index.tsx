"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie, deleteCookie, hasCookie } from "cookies-next";
import { UserPublic } from "common/types";

export const useToken = () => {
  const [token, setToken] = useState<string | null>(
    hasCookie("hurado/token") ? getCookie("hurado/token")! : null
  );

  useEffect(() => {
    if (token === null) {
      return deleteCookie("hurado/token");
    }

    setCookie("hurado/token", token);
  }, [token]);

  return { token, setToken };
};

export const useUser = () => {
  const [user, setUser] = useState<UserPublic | null>(
    hasCookie("hurado/user") ? JSON.parse(getCookie("hurado/user")!) : null
  );

  useEffect(() => {
    if (user === null) {
      return deleteCookie("hurado/user");
    }

    setCookie("hurado/user", user);
  }, [user]);

  return { user, setUser };
};
