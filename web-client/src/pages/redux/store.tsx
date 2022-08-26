import { configureStore } from '@reduxjs/toolkit';

import userReducer, { UserState, UserStateLoader } from './userSlice';

export const userStateLoader = new UserStateLoader();

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