import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './redux/store.ts'
import { BrowserRouter } from 'react-router-dom'
import Router from './components/Router/index.tsx'
import ParamsProvider from './contexts/Params.tsx'
import DialogProvider from './contexts/Dialog.tsx'
import Dialog from './components/Dialog/index.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ServiceWorker from './components/ServiceWorker/index.tsx'
import BackgroundService from './components/BackgroundService/index.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <DialogProvider>
            <ParamsProvider>
              <BrowserRouter>
                <Router />
              </BrowserRouter>
              <Dialog />
              <ServiceWorker />
              <BackgroundService />
            </ParamsProvider>
          </DialogProvider>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
