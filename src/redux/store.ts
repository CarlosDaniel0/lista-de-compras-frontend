import { configureStore } from '@reduxjs/toolkit';
import config from './slices/config';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['user', 'isLoggedIn', 'context']
};

const reducer = persistReducer(persistConfig, config);

export const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
