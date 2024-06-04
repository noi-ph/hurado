"use client";

import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { SessionData } from "common/types";

type SessionContextValue = {
  session: SessionData | null;
  setSession: Dispatch<SetStateAction<SessionData | null>>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  initial: SessionData | null;
  children?: ReactNode;
};

export function SessionProvider({ initial, children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionData | null>(initial);

  const value: SessionContextValue = {
    session,
    setSession,
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionData | null {
  const value = useContext(SessionContext);
  if (value == null) {
    throw new Error("Must have an ancestor SessionProvider to for 'useSession'");
  }
  return value.session;
}

export function useSessionWithUpdate(): SessionContextValue {
  const value = useContext(SessionContext);
  if (value == null) {
    throw new Error("Must have an ancestor SessionProvider to for 'useSession'");
  }
  return value;
}
