import { createSlice } from '@reduxjs/toolkit';

import { UserConstants } from '../../utils/types';

export type UserState = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

export class UserStateLoader {
  loadState(): UserState {
    try {
      const userJson = localStorage.getItem(UserConstants.Current);

      if (!userJson) {
        return this.initializeState();
      }

      return JSON.parse(userJson);
    } catch (err) {
      return this.initializeState();
    }
  }

  saveState(state: UserState) {
    const userJson = JSON.stringify(state);
    localStorage.setItem(UserConstants.Current, userJson);
  }

  clearState() {
    localStorage.removeItem(UserConstants.Current);
    localStorage.removeItem(UserConstants.JWT);
  }

  initializeState(): UserState {
    return {
      id: 0,
      username: '',
      email: '',
      isAdmin: false,
    };
  }
}

export const userStateLoader = new UserStateLoader();
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: 0,
    username: '',
    email: '',
    isAdmin: false,
  },
  reducers: {
    set: (state, action) => {
      const { id, username, email, isAdmin } = action.payload;
      state.id = id;
      state.username = username;
      state.email = email;
      state.isAdmin = isAdmin;

      userStateLoader.saveState(state);
    },
    clear: (state) => {
      state.id = 0;
      state.username = '';
      state.email = '';
      state.isAdmin = false;

      userStateLoader.clearState();
    },
  },
});

export const { set, clear } = userSlice.actions;

export default userSlice.reducer;