import { createSlice } from '@reduxjs/toolkit';

import { AppConfig } from 'utils/AppConfig';
import { ServerAPI } from 'types/openapi';
import { http, HttpResponse } from 'utils/http';
import { UserEnum } from 'utils/UserEnum';

export type UserState = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
};

export class UserStateLoader {
  async loadState(): Promise<UserState> {
    try {
      const userInfo = localStorage.getItem(UserEnum.Info);
      const userToken = localStorage.getItem(UserEnum.Token);

      if (userInfo && userToken) {
        const payload: ServerAPI['LoginPayload'] = JSON.parse(userInfo);
        const res: HttpResponse<ServerAPI['UserVerification']> = await http.post(`${AppConfig.server}/v1/users/verify`, payload);
        if (res.status == 200) {
          return payload;
        }
      }
    } catch (e) {}
    return this.initializeState();
  }

  saveState(state: UserState) {
    const userInfo = JSON.stringify(state);
    localStorage.setItem(UserEnum.Info, userInfo);
  }

  clearState() {
    localStorage.removeItem(UserEnum.Info);
    localStorage.removeItem(UserEnum.Token);
  }

  initializeState(): UserState {
    return {
      id: '',
      username: '',
      email: '',
      isAdmin: false
    };
  }
}

export const userStateLoader = new UserStateLoader();
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: '',
    username: '',
    email: '',
    isAdmin: false
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
      state.id = '';
      state.username = '';
      state.email = '';
      state.isAdmin = false;

      userStateLoader.clearState();
    }
  }
});

export const { set, clear } = userSlice.actions;
export default userSlice.reducer;