import React, { ReactNode } from 'react';
import Link from 'next/link';

type NavbarProps = {
  children: ReactNode;
};

type NavBarCardProps = {
  href: string;
  value: string;
};

export const NavBarCard = (props: NavBarCardProps) => (
  <li className='mr-6'>
    <Link href={props.href}>
      <a>
        {props.value}
      </a>
    </Link>
  </li>
);

export const NavBar = (props: NavbarProps) => (
  <div>
    <ul className='navbar flex flex-wrap text-xl'>
      {props.children}
      <style jsx>
        {`
          .navbar :global(a) {
            @apply text-gray-700;
          }

          .navbar :global(a:hover) {
            @apply no-underline text-gray-900;
          }
        `}
      </style>
    </ul>
  </div>
);