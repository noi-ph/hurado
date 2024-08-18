import { Navbar } from "client/components/navbar";
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
