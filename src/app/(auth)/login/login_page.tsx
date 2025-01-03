"use client";

import type { FunctionComponent } from "react";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

import http from "client/http";
import { useSessionWithUpdate } from "client/sessions";
import styles from "./page.module.css";
import { APIPath, getAPIPath, getPath, Path } from "client/paths";

const LoginPage: FunctionComponent = () => {
  const [throttle, setThrottle] = useState<boolean>(false);

  const submit = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    submit.current!.style.backgroundColor = throttle ? "var(--purple-light)" : "var(--purple)";
  }, [throttle]);

  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { setSession } = useSessionWithUpdate();

  const login = useCallback(async () => {
    const loginURL = getAPIPath({ kind: APIPath.Login });
    const response = await http.post(loginURL, {
      username,
      password,
    });
    if (response.status >= 300) {
      throw new Error(response.data);
    }
    const homeURL = getPath({ kind: Path.Home });
    setSession(response.data);
    router.push(homeURL);
    router.refresh();
  }, [router, username, password, setSession]);

  const throttledLogin = useCallback(async () => {
    if (throttle) {
      return;
    }

    try {
      setThrottle(true);
      await login();
    } finally {
      setThrottle(false);
    }
  }, [login, throttle]);

  return (
    <form id={styles.loginform}>
      <h1>Login</h1>
      <div className={styles.row}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className={styles.row}>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="button" ref={submit} disabled={throttle} onClick={throttledLogin}>
        Submit
      </button>
    </form>
  );
};

export default LoginPage;
