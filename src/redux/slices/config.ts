import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../util/types";

const initialState: { user: Partial<User>, token: string, isLoggedIn: boolean, theme: 'dark' | 'light' } = {
  user: {},
  token: '',
  theme: 'light',
  isLoggedIn: false,
};

const config = createSlice({
  name: "config",
  initialState,
  reducers: {
    changeTheme: (state, action) => {
      state.theme = action.payload
    },
    signIn: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.token = action.payload.token,
      state.isLoggedIn = true;
    },
    signOut: (state) => {
      state.user = {};
      state.token = ''
      state.isLoggedIn = false;
    },
  },
});

export const { signIn, signOut, changeTheme } = config.actions;
export default config.reducer;
