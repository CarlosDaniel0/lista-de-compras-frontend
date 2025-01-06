import { Outlet, Navigate } from 'react-router-dom'
import { store } from '../../redux/store'

export default function ProtectedRouters() {
   const { isLoggedIn } = store.getState()
  return isLoggedIn ? <Outlet /> : <Navigate to="/" />
}