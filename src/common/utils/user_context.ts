import { UserPublic } from "common/types";
import { createContext } from "react";

export const UserContext = createContext(undefined as unknown as UserPublic | undefined);