import { AppProps } from 'next/app';

import { Provider } from 'react-redux';

import store from './redux/store';

import { Main } from '../components/Main';
import '../styles/main.css';
import '../styles/prism-a11y-dark.css';

const App = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <Main>
      <Component {...pageProps} />
    </Main>
  </Provider>
);

export default App;