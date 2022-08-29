import React from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { MathJaxContext } from 'better-react-mathjax';

import { Main } from 'components/Main';
import store from 'pages/redux/store';

import 'styles/main.css';
import 'styles/fonts.css';
import { NavBar } from 'components/NavBar';
import { Body } from 'components/Body/Body';

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"]
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"]
    ]
  }
};

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  // TODO: Fix this later when other people start styling things.
  let main: React.ReactNode;
  if (router.pathname == '/tasks/edit/[id]' || router.pathname == '/playground') {
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
      <MathJaxContext config={config}>
        <NavBar />
        <Body>
          {main}
        </Body>
      </MathJaxContext>
    </Provider>
  );
};

export default App;