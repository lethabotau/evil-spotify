import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken } from '../utils/spotifyAuth'

export function AuthGuard() {
  if (!getAccessToken()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
