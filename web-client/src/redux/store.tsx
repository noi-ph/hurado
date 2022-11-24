import { configureStore } from '@reduxjs/toolkit';

import userReducer, { UserState, userStateLoader } from 'redux/userSlice';

export type ReduxState = {
  user: UserState;
};

export default configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: {
    user: userStateLoader.loadState(),
  },
});