"use client";

import type { FunctionComponent } from "react";

import Link from "next/link";

import { useSession } from "client/sessions";
import styles from "./index.module.css";

export const Member: FunctionComponent = () => {
  const session = useSession();
  if (session != null && session.user != null) {
    return (
      <div className={`${styles.row} ${styles.desktoplinks}`}>
        <Link href="/logout">Logout</Link>
        <div>Welcome {session?.user.name}</div>
      </div>
    );
  } else {
    return null;
  }
};
