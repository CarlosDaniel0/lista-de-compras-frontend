import { createSlice } from "@reduxjs/toolkit";
import { Config } from "../../util/types";

const initialState: Config = {
  user: {},
  token: '',
  theme: 'light',
  settings: {
    groupProducts: false,
    localPersistence: false
  },
  permissions: [],
  isLoggedIn: false,
};

const config = createSlice({
  name: "config",
  initialState,
  reducers: {
    changeTheme: (state, action) => {
      state.theme = action.payload
    },
    updateSettings: (state, action) => {
      state.settings = action.payload 
    },
    addPermission: (state, action) => {
      state.permissions.push(action.payload)
    },
    removePermission: (state, action) => {
      state.permissions.splice(state.permissions.indexOf(action.payload), 1)
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

export const { signIn, signOut, changeTheme, updateSettings, addPermission, removePermission } = config.actions;
export default config.reducer;
