import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';


import { AppConfig } from '../utils/AppConfig';
import { ReduxState } from 'pages/redux/store';
import { NavBar, NavBarCard } from './NavBars/NavBar';

type MainProps = {
  children: ReactNode;
};

const MainNavBarContents = () => {
  const user = useSelector((state: ReduxState) => state.user);

  // Why are you logging me out when I first load the page??
  // const router = useRouter();

  // Make the component rerender every time the user global variable changes
  // React.useEffect(() => {
  //   if (!user.id) {
  //     router.push('/session/logout');
  //   }
  // }, [user.id]);

  if (user.id) {
    return (
      <React.Fragment>
        <NavBarCard href='/tasks/create' value='Create task' />
        <NavBarCard href={`/profile/${user.id}`} value={user.username} />
        <NavBarCard href='/profile/edit' value='Edit profile' />
        <NavBarCard href='/session/logout' value='Log-out' />
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <NavBarCard href='/session/signup' value='Sign up' />
        <NavBarCard href='/session/login' value='Log-in' />
      </React.Fragment>
    );
  }
};

export const Main = (props: MainProps) => (
  <div className='antialiased w-full text-gray-700 px-3 md:px-0'>
    <div className='max-w-screen-md mx-auto'>
      <div className='border-b border-gray-300'>
        <div className='pt-16 pb-8'>
          <div className='font-semibold text-3xl text-gray-900'>
            {AppConfig.title}
          </div>
          <div className='text-xl'>
            {AppConfig.description}
          </div>
        </div>
        <NavBar>
          <NavBarCard href='/' value='Home' />
          <NavBarCard href='/tasks/all' value='All tasks' />
          <MainNavBarContents />
          <NavBarCard href='/session/test' value='Test' />
        </NavBar>
      </div>
      <div className='text-xl py-5'>
        {props.children}
      </div>
      <div className='border-t border-gray-300 text-center py-8 text-sm'>
        © Copyright {new Date().getFullYear()} {AppConfig.title}. Powered with{' '}
        <span role='img' aria-label='Love'>
          ♥
        </span>{' '}
        by <a href='https://creativedesignsguru.com'>CreativeDesignsGuru</a>
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