import React from 'react';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { MathJaxContext } from 'better-react-mathjax';

import 'styles/main.css';
import 'styles/fonts.css';
import store from 'redux/store';
import { NavBar } from 'components/NavBar';
import { Body } from 'components/Body';

const config = {
  loader: { load: ['[tex]/html']},
  tex: {
    packages: { '[+]': ['html'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ]
  }
};

const App = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <MathJaxContext config={config}>
      <NavBar />
      <Body>
        <Component {...pageProps} />
      </Body>
    </MathJaxContext>
  </Provider>
);

export default App;