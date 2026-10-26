import { createContext, use } from 'react'
import type { ApiOwnOrg, CredentialsPayload } from './types'

export interface AuthValue {
  org: ApiOwnOrg | null
  /** `true` enquanto a sessão salva no cookie ainda está sendo restaurada. */
  restoring: boolean
  signIn: (credentials: CredentialsPayload) => Promise<void>
  signOut: () => Promise<void>
  /** Busca de novo a ONG — o status da verificação pode ter mudado. */
  refreshOrg: () => Promise<void>
}

/** Separado do provider para o Fast Refresh não perder estado a cada edição. */
export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  return value
}
