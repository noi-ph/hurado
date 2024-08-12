import { Work_Sans } from "next/font/google";
import { Navbar } from "client/components/navbar";
import styles from "./layout.module.css";
import classNames from "classnames";

const worksans = Work_Sans({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

type AdminLayoutProps = {
  children?: React.ReactNode;
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <body className={classNames(worksans.className, styles.admin)}>
      <header className={styles.header}>
        <Navbar />
      </header>
      <main className={styles.main}>{children}</main>
    </body>
  );
};
