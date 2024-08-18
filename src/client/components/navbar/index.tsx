"use client";

import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import { useSession } from "client/sessions";

type NavbarProps = {
  className?: string;
};

export const Navbar = memo(({ className }: NavbarProps) => {
  return (
    <div className={classNames("flex bg-blue-400 text-white", className)}>
      <div className="flex items-center gap-2 w-full max-w-[64rem] px-4 mx-auto">
        <NavbarLink href="/">Home</NavbarLink>
        <NavbarLink href="/tasks">Tasks</NavbarLink>
        <NavbarAccount />
      </div>
    </div>
  );
});

export const NavbarAccount = memo(() => {
  const session = useSession();
  if (session == null || session.user == null) {
    return (
      <>
        <NavbarLink href="/login" className="ml-auto">Login</NavbarLink>
        <NavbarLink href="/register">Register</NavbarLink>
      </>
    );
  }
  return (
    <>
      <div className="text-2xl px-1 py-3 ml-auto">{session?.user.name}</div>
      <NavbarLink href="/logout">Logout</NavbarLink>
    </>
  );
});

type NavbarLinkProps = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

const NavbarLink = ({ href, className, children }: NavbarLinkProps) => {
  return (
    <Link className={classNames("text-2xl px-1 py-3 hover:text-blue-200", className)} href={href}>
      {children}
    </Link>
  );
};
