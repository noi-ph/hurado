import { configureStore } from '@reduxjs/toolkit';

import userReducer, { UserStateLoader } from './userSlice';

export const userStateLoader = new UserStateLoader();

export default configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: userStateLoader.loadState(),
});