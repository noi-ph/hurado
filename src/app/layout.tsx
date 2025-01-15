import "@root/global.css";
import "react-toastify/dist/ReactToastify.css";

import { Montserrat, Roboto, Space_Mono } from "next/font/google";

import type { FunctionComponent, ReactNode } from "react";
import type { Metadata } from "next";
import { ToastContainer, Zoom } from "react-toastify";

import { SessionProvider } from "client/sessions";
import { getSession } from "server/sessions";
import classNames from "classnames";
import Head from "next/head";

const fontMontserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  preload: true,
});

const fontRoboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  variable: "--font-roboto",
  preload: true,
});

const fontSpaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: "Hurado | %s",
    default: "Hurado",
  },
  description: "NOI.PH Online Judge. The best way to learn math and coding.",
};

type RootLayoutProps = {
  children: ReactNode;
};
const RootLayout: FunctionComponent<RootLayoutProps> = async ({ children }) => {
  const session = await getSession();

  return (
    <SessionProvider initial={session}>
      <html
        lang="en"
        className={classNames(fontMontserrat.variable, fontRoboto.variable, fontSpaceMono.variable)}
      >
        <body className="flex flex-col min-h-full items-stretch">
          <ToastContainer
            position="top-center"
            hideProgressBar={true}
            transition={Zoom}
            closeOnClick
            closeButton={false}
          />
          {children}
          <div id="modal-root"/>
        </body>
      </html>
    </SessionProvider>
  );
};

export default RootLayout;
