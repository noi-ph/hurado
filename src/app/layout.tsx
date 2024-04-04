import "@root/reset.css";
import "@root/global.css";

import type { FunctionComponent, ReactNode } from "react";
import type { Metadata } from "next";

// eslint-disable-next-line camelcase
import { Work_Sans } from "next/font/google";

import { Navbar } from "lib/components";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Algurado",
    default: "Algurado",
  },
  description: "NOI.PH's online judge.",
};

type props = { children: ReactNode };

const worksans = Work_Sans({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const RootLayout: FunctionComponent<props> = ({ children }) => (
  <html lang="en">
    <body className={worksans.className}>
      <header id={styles.navbar}>
        <Navbar />
      </header>
      <main>{children}</main>
      <footer>
        <p className={styles.copyright}>© 2024 NOI.PH</p>
      </footer>
    </body>
  </html>
);

export default RootLayout;
