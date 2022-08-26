import { configureStore } from '@reduxjs/toolkit';

import userReducer, { userStateLoader } from './userSlice';

export default configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: userStateLoader.loadState(),
});