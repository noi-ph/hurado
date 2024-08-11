import { Work_Sans } from "next/font/google";
import { Navbar } from "client/components/navbar";
import styles from "./layout.module.css";
import classnames from "classnames";

const worksans = Work_Sans({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

type DefaultLayoutProps = {
  children?: React.ReactNode;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <body className={classnames(worksans.className)}>
      <header className={styles.header}>
        <Navbar />
      </header>
      <main>{children}</main>
      <footer>
        <p className={styles.copyright}>© 2024 NOI.PH!!!</p>
      </footer>
    </body>
  );
};
