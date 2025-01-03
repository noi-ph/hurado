"use client";

import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import { useSession } from "client/sessions";
import { getPath, Path } from "client/paths";

type NavbarProps = {
  className?: string;
};

export const Navbar = memo(({ className }: NavbarProps) => {
  return (
    <div className={classNames("flex bg-blue-400 text-white", className)}>
      <div className="flex items-center gap-2 w-full max-w-[64rem] px-4 mx-auto">
        <NavbarLink href={getPath({ kind: Path.Home })}>Home</NavbarLink>
        <NavbarLink href={getPath({ kind: Path.TaskList })}>Tasks</NavbarLink>
        <NavbarLink href={getPath({ kind: Path.ContestList })}>Contests</NavbarLink>
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
        <NavbarLink href={getPath({kind: Path.AccountLogin })} className="ml-auto">Login</NavbarLink>
        <NavbarLink href={getPath({kind: Path.AccountRegister })}>Register</NavbarLink>
      </>
    );
  }
  return (
    <>
      <div className="text-2xl px-1 py-3 ml-auto">{session?.user.name}</div>
      <NavbarLink href={getPath({kind: Path.AccountLogout })}>Logout</NavbarLink>
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
