import { Navbar } from "client/components/navbar";
import styles from "./layout.module.css";

type DefaultLayoutProps = {
  children?: React.ReactNode;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <header className={styles.header}>
        <Navbar />
      </header>
      <main>{children}</main>
      <footer>
        <p className={styles.copyright}>© 2024 NOI.PH!!!</p>
      </footer>
    </>
  );
};
