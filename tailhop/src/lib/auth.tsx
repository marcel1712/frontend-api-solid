import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { authenticateOrg, fetchOrg, setAuthToken } from './api'
import { AuthContext } from './auth-context'
import type { ApiOrg, CredentialsPayload } from './types'

const STORAGE_KEY = 'tailhop.session'

interface StoredSession {
  token: string
  org: ApiOrg
}

/**
 * Lê o `sub` e o `exp` do JWT sem verificar assinatura — quem valida é a API.
 * Isto serve só para saber de qual org é a sessão e descartar um token já
 * vencido antes de gastar uma requisição com ele.
 */
function readToken(token: string): { orgId: string; expiresAt: number } | null {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { sub, exp } = JSON.parse(json) as { sub?: string; exp?: number }
    if (!sub) return null
    return { orgId: sub, expiresAt: (exp ?? 0) * 1000 }
  } catch {
    return null
  }
}

/**
 * Restaura a sessão salva de forma síncrona, antes do primeiro render, e já
 * arma o token no cliente de API. Fazer isso num efeito abriria uma janela em
 * que um filho dispara requisição autenticada sem token, e faria quem já estava
 * logado piscar a tela de login a cada refresh.
 */
function restoreSession(): StoredSession | null {
  let session: StoredSession | null = null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as StoredSession
      const claims = readToken(stored.token)

      // Token vencido não vira sessão: melhor pedir login do que deixar a ONG
      // preencher um cadastro inteiro para tomar 401 no envio.
      if (claims && (!claims.expiresAt || claims.expiresAt > Date.now())) {
        session = stored
      }
    }
  } catch {
    session = null
  }

  setAuthToken(session?.token ?? null)
  return session
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(restoreSession)

  const signIn = useCallback(async (credentials: CredentialsPayload) => {
    const token = await authenticateOrg(credentials)

    const claims = readToken(token)
    if (!claims) throw new Error('O servidor devolveu uma sessão inválida.')

    // O token precisa estar armado antes da próxima chamada: o perfil da ONG
    // já sai autenticado.
    setAuthToken(token)
    const org = await fetchOrg(claims.orgId)

    const next = { token, org }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const signOut = useCallback(() => {
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ org: session?.org ?? null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
