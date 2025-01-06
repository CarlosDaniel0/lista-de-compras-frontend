import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../util/types";

const initialState: { user: Partial<User>, token: string, isLoggedIn: boolean  } = {
  user: {},
  token: '',
  isLoggedIn: false,
};

const config = createSlice({
  name: "config",
  initialState,
  reducers: {
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

export const { signIn, signOut } = config.actions;
export default config.reducer;
