import "@root/reset.css";
import "@root/global.css";
import 'overlayscrollbars/overlayscrollbars.css';

import type { FunctionComponent, ReactNode } from "react";
import type { Metadata } from "next";

import { SessionProvider } from "client/sessions";
import { getSession } from "server/sessions";

export const metadata: Metadata = {
  title: {
    template: "%s | Algurado",
    default: "Algurado",
  },
  description: "NOI.PH's online judge.",
};


type RootLayoutProps = {
  children: ReactNode;
};
const RootLayout: FunctionComponent<RootLayoutProps> = ({ children }) => {
  const session = getSession();

  return (
    <SessionProvider initial={session}>
      <html lang="en">
        {children}
      </html>
    </SessionProvider>
  );
};

export default RootLayout;
