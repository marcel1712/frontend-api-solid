import { createContext, use } from 'react'
import type { ApiOrg, CredentialsPayload } from './types'

export interface AuthValue {
  org: ApiOrg | null
  signIn: (credentials: CredentialsPayload) => Promise<void>
  signOut: () => void
}

/** Separado do provider para o Fast Refresh não perder estado a cada edição. */
export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  return value
}
