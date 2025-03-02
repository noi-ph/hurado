import { Navbar } from "client/components/navbar";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import styles from "./layout.module.css";

type AdminLayoutProps = {
  children?: React.ReactNode;
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};
