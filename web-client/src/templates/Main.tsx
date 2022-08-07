import React, { ReactNode } from 'react';
import axios from 'axios';

import Link from 'next/link';

import { useAsyncEffect } from 'use-async-effect';

import { Navbar } from '../navigation/Navbar';
import { AppConfig } from '../utils/AppConfig';
import { UserConstants } from '../pages/session/types'

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const MainNavBarContents = () => {
  let isLoggedIn = false;

  async function checkLoggedIn() {
    const userJson = localStorage.getItem(UserConstants.CURRENT);
    const jwt = localStorage.getItem(UserConstants.JWT);
    if (userJson == null || jwt == null) {
      return;
    }
  
    const user = JSON.parse(userJson);
    try {
      await axios.get(`http://localhost:4000/v1/users/${user.id}`, {
        headers: {
          Authorization: jwt,
        },
      });
      isLoggedIn = true;
      return;
    } catch (err) {
      localStorage.removeItem(UserConstants.CURRENT);
      localStorage.removeItem(UserConstants.JWT);
    }
  }

  useAsyncEffect(checkLoggedIn);

  if (isLoggedIn) {
    return (
      <li className="mr-6">
        <Link href="/session/logout">
          <a>Log-out</a>
        </Link>
      </li>
    )
  } else {
    return (
      <>
        <li className="mr-6">
          <Link href="/session/signup">
            <a>Sign up</a>
          </Link>
        </li>
        <li className="mr-6">
          <Link href="/session/login">
            <a>Log-in</a>
          </Link>
        </li>
      </>
    )
  }
}

const Main = (props: IMainProps) => (
  <div className="antialiased w-full text-gray-700 px-3 md:px-0">
    {props.meta}

    <div className="max-w-screen-md mx-auto">
      <div className="border-b border-gray-300">
        <div className="pt-16 pb-8">
          <div className="font-semibold text-3xl text-gray-900">
            {AppConfig.title}
          </div>
          <div className="text-xl">{AppConfig.description}</div>
        </div>
        <div>
          <Navbar>
            <li className="mr-6">
              <Link href="/">
                <a>Home</a>
              </Link>
            </li>
            <MainNavBarContents/>
            <li className="mr-6">
              <Link href="/session/test">
                <a>Test</a>
              </Link>
            </li>
          </Navbar>
        </div>
      </div>

      <div className="text-xl py-5">{props.children}</div>

      <div className="border-t border-gray-300 text-center py-8 text-sm">
        © Copyright {new Date().getFullYear()} {AppConfig.title}. Powered with{' '}
        <span role="img" aria-label="Love">
          ♥
        </span>{' '}
        by <a href="https://creativedesignsguru.com">CreativeDesignsGuru</a>
        {/*
         * PLEASE READ THIS SECTION
         * We'll really appreciate if you could have a link to our website
         * The link doesn't need to appear on every pages, one link on one page is enough.
         * Thank you for your support it'll mean a lot for us.
         */}
      </div>
    </div>
  </div>
);

export { Main };
