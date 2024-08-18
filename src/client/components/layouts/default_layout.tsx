import { Navbar } from "client/components/navbar";
import styles from "./layout.module.css";

type DefaultLayoutProps = {
  children?: React.ReactNode;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <Navbar />
      <div className="max-w-[64rem] px-4 mx-auto my-4">
        <main>{children}</main>
      </div>
      <footer>
        <p className={styles.copyright}>© 2024 NOI.PH!!!</p>
      </footer>
    </>
  );
};
