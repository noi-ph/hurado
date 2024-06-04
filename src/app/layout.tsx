import "@root/reset.css";
import "@root/global.css";

import type { FunctionComponent, ReactNode } from "react";
import type { Metadata } from "next";

// eslint-disable-next-line camelcase
import { Work_Sans } from "next/font/google";

import { Navbar } from "client/components";
import { SessionProvider } from "client/sessions";
import { getSession } from "server/sessions";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Algurado",
    default: "Algurado",
  },
  description: "NOI.PH's online judge.",
};

const worksans = Work_Sans({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

type RootLayoutProps = {
  children: ReactNode;
};
const RootLayout: FunctionComponent<RootLayoutProps> = ({ children }) => {
  const session = getSession();

  return (
    <SessionProvider initial={session}>
      <html lang="en">
        <body className={worksans.className}>
          <header id={styles.navbar}>
            <Navbar />
          </header>
          <main>{children}</main>
          <footer>
            <p className={styles.copyright}>© 2024 NOI.PH!!!</p>
          </footer>
        </body>
      </html>
    </SessionProvider>
  );
};

export default RootLayout;
