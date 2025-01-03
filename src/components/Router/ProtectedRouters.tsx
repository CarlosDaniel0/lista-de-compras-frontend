import { Outlet, Navigate } from 'react-router-dom'

export default function ProtectedRouters() {
  const user = null
  return user ? <Outlet /> : <Navigate to="/" />
}