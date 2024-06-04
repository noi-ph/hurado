"use client";

import type { FunctionComponent, ReactNode } from "react";

import Link from "next/link";

import { Fragment, useEffect, useState } from "react";

import { useSession } from "client/sessions";
import styles from "./index.module.css";

import { Member } from "./member";
import { Guest } from "./guest";

export const Navbar: FunctionComponent = () => {
  const session = useSession();
  const [links, setLinks] = useState<ReactNode>(null);

  useEffect(() => {
    setLinks(session ? <Member /> : <Guest />);
  }, [session]);

  return (
    <>
      <div className={styles.row}>
        <Link href="/">Home</Link>
        <Link href="/tasks">Tasks</Link>
        {links}
      </div>
      <Link href="/sitemap">Sitemap</Link>
    </>
  );
};
