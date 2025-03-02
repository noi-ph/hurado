"use client";

import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import NoiphBlueless from "assets/images/noiph-blueless.png";
import FacebookIcon from "assets/icons/facebook.svg";
import InstagramIcon from "assets/icons/instagram.svg";
import GithubIcon from "assets/icons/github.svg";

type NavbarProps = {
  className?: string;
};

// eslint-disable-next-line react/display-name, @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
export const Footer = memo(({ className }: NavbarProps) => {
  return (
    <footer className="bg-blue-400 text-white p-4 lg:px-12">
      <div className="flex flex-col md:flex-row gap-2 w-full max-w-[64rem] px-4 mx-auto">
        <a href="https://noi.ph" target="_blank" className="self-center hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-existing error before eslint inclusion */}
          <img src={NoiphBlueless.src} alt="Logo" className="w-20" />
        </a>
        <div className="text-neutral-800 text-sm font-light self-center w-1/2 text-center mx-auto md:w-1/3 md:text-start md:mx-0 mb-3 md:mb-0">
          <span className="font-semibold">NOI.PH Inc.</span> is an SEC-registered Philippine non-profit organization dedicated to elevating computer science education nationwide.
        </div>
        <div className="flex-auto flex flex-col justify-center items-center text-center">
          <a href="https://noi.ph/wpautoterms/terms-and-conditions/"  target="_blank" className="hover:opacity-80">
            Terms of Service
          </a>
          <a href="https://noi.ph/wpautoterms/privacy-policy/" target="_blank" className="hover:opacity-80">
            Privacy Policy
          </a>
          <a href="mailto:ask@noi.ph" className="hover:opacity-80">
            Contact Us
          </a>
        </div>
        <div className="flex-initial flex justify-center items-center">
          <div className="h-12 w-12 flex justify-center items-center">
            <a href="https://facebook.com/noi.philippines" target="_blank" className="justify-center items-center hover:opacity-80">
              <FacebookIcon className="text-white bg-red h-9 hover:h-10"/>
            </a>
          </div>
          <div className="h-12 w-12 flex justify-center items-center">
            <a href="https://instagram.com/noi.philippines" target="_blank" className="justify-center items-center hover:opacity-80">
              <InstagramIcon className="text-white bg-red h-9 hover:h-10"/>
            </a>
          </div>
          <div className="h-12 w-12 flex justify-center items-center">
            <a href="https://github.com/noi-ph/hurado" target="_blank" className="justify-center items-center hover:opacity-80">
              <GithubIcon className="text-white bg-red h-9 hover:h-10"/>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

type FooterLinkProps = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
const FooterLink = ({ href, className, children }: FooterLinkProps) => {
  return (
    <Link className={classNames("text-2xl px-1 py-3 hover:text-blue-200", className)} href={href}>
      {children}
    </Link>
  );
};
