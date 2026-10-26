import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

/** Fecha as telas da ONG para quem não está autenticado. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { org, restoring } = useAuth()
  const location = useLocation()

  // Mandar para o login antes da sessão do cookie voltar expulsaria, a cada
  // recarregamento, quem estava logado.
  if (restoring) {
    return (
      <p role="status" className="grid min-h-dvh place-items-center font-semibold text-ink-soft">
        Entrando na sua conta…
      </p>
    )
  }

  if (!org) return <Navigate to="/ong/entrar" replace state={{ from: location }} />
  return children
}
