import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

/** Fecha as telas da ONG para quem não está autenticado. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { org } = useAuth()
  const location = useLocation()

  if (!org) return <Navigate to="/ong/entrar" replace state={{ from: location }} />
  return children
}
