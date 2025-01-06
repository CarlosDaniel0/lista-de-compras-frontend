import { configureStore } from '@reduxjs/toolkit';
import config from './slices/config';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { thunk } from 'redux-thunk';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['user', 'isLoggedIn']
};

const reducer = persistReducer(persistConfig, config);

export const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(thunk),
});

export const persistor = persistStore(store);
