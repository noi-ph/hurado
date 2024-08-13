import "@root/reset.css";
import "@root/global.css";
import { Montserrat, Roboto, Space_Mono } from "next/font/google";

import type { FunctionComponent, ReactNode } from "react";
import type { Metadata } from "next";

import { SessionProvider } from "client/sessions";
import { getSession } from "server/sessions";
import classNames from "classnames";

const fontMontserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  preload: false,
});

const fontRoboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  variable: "--font-roboto",
  preload: false,
});

const fontSpaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  preload: false,
});

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
      <html
        lang="en"
        className={classNames(fontMontserrat.variable, fontRoboto.variable, fontSpaceMono.variable)}
      >
        <body>{children}</body>
      </html>
    </SessionProvider>
  );
};

export default RootLayout;
