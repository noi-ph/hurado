"use client";

import classNames from "classnames";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "client/sessions";
import { getPath, Path } from "client/paths";
import HamburgerSVG from "assets/icons/hamburger.svg";
import HuradoPNG from "assets/images/hurado.png";

type NavbarProps = {
  className?: string;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const Navbar = memo(({ className }: NavbarProps) => {
  const [isOpen, setIsOpen] =  useState(false);

  const linksRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    const open = !isOpen;
    setIsOpen(open);
    if (linksRef.current) {
      linksRef.current.style.height = open ? `${linksRef.current.scrollHeight}px` : "0px";
    }
  }, [isOpen]);

  useEffect(() => {
    const onResize = () => {
      if (linksRef.current) {
        linksRef.current.style.height = '';
      }
      setIsOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={classNames("flex bg-blue-400 text-white", className)}>
      <div className="lg:flex lg:items-center lg:gap-2 w-full max-w-[64rem] px-4 py-3 mx-auto">
        <div className="flex justify-between items-center">
          <Link href={getPath({ kind: Path.Home })} className="flex items-center hover:opacity-75 mr-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-existing error before eslint inclusion */}
            <img src={HuradoPNG.src} alt="Hurado" className="w-7 h-7" />
            <span className="text-2xl">Hurado</span>
          </Link>
          <button
            type="button"
            className="text-white rounded border-2 hover:opacity-70 focus:outline-none lg:hidden"
            onClick={toggleOpen}
          >
            <HamburgerSVG className="w-8 h-8" />
          </button>
        </div>
        <div
          className="h-0 lg:h-auto flex flex-col items-start lg:flex-row lg:items-center gap-2 flex-1 box-border overflow-hidden transition-[height] duration-300 ease-in-out"
          ref={linksRef}
        >
          <NavbarLink href={getPath({ kind: Path.ProblemSetList })} className="mt-2 lg:mt-0">Problems</NavbarLink>
          <NavbarLink href={getPath({ kind: Path.ContestList })}>Contests</NavbarLink>
          <NavbarAccount />
        </div>
      </div>
    </div>
  );
});

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const NavbarAccount = memo(() => {
  const session = useSession();
  if (session == null || session.user == null) {
    return (
      <>
        <NavbarLink href={getPath({kind: Path.AccountLogin })} className="lg:ml-auto">Login</NavbarLink>
        <NavbarLink href={getPath({kind: Path.AccountRegister })}>Register</NavbarLink>
      </>
    );
  } else if (session.user.role === "admin") {
    return (
      <>
        <NavbarLink href={getPath({kind: Path.AdminHome })} className="lg:ml-auto">{session.user.name || 'Anonymous'}</NavbarLink>
        <NavbarLink href={getPath({kind: Path.AccountLogout })}>Logout</NavbarLink>
      </>
    );
  } else {
    return (
      <>
        <div className="text-2xl px-1 lg:ml-auto">{session.user.name || 'Anonymous'}</div>
        <NavbarLink href={getPath({kind: Path.AccountLogout })}>Logout</NavbarLink>
      </>
    );
  }
});

type NavbarLinkProps = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

const NavbarLink = ({ href, className, children }: NavbarLinkProps) => {
  return (
    <Link className={classNames("text-2xl hover:text-blue-200", className)} href={href}>
      {children}
    </Link>
  );
};
