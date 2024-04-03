'use client';

import type { FunctionComponent } from 'react';

import { useRouter } from 'next/navigation';
import {
  useEffect, useState, useRef, useCallback,
} from 'react';

import { useToken, useUser } from 'lib/hooks';
import styles from './page.module.css';

const Page: FunctionComponent = () => {
  const [throttle, setThrottle] = useState<boolean>(false);

  const submit = useRef<HTMLButtonElement>(null);

  useEffect(() => {
        submit.current!.style.backgroundColor = throttle
          ? 'var(--purple-light)'
          : 'var(--purple)';
  }, [throttle]);

  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { setUser } = useUser();
  const { setToken } = useToken();

  const login = useCallback(async () => {
    try {
      const response = await fetch('api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('');
      }

      setToken(response.headers.get('Authorization')!.split(' ')[1]);
      setUser(await response.json());
      router.push('/dashboard');
    } catch (error) {}
  }, [router, username, password, setToken, setUser]);

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
        <input
          type="text"
          id="username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className={styles.row}>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="button"
        ref={submit}
        disabled={throttle}
        onClick={throttledLogin}
      >
        Submit
      </button>
    </form>
  );
};

export default Page;
