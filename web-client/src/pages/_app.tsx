import React from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { Provider } from 'react-redux';

import { Main } from '../components/Main';
import store from './redux/store';

import '../styles/main.css';
import '../styles/fonts.css';
import '../styles/prism-a11y-dark.css';

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  // TODO: Fix this later when other people start styling things.
  let main: React.ReactNode;
  if (router.pathname == '/tasks/edit/[id]') {
    main = <Component {...pageProps}/>;
  } else {
    main = (
      <Main>
        <Component {...pageProps} />
      </Main>
    );
  }
  return (
    <Provider store={store}>
      {main}
    </Provider>
  );
};

export default App;