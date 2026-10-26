import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  authenticateOrg,
  fetchOrg,
  onSessionEnded,
  renewSession,
  setAuthToken,
  signOutOrg,
} from './api'
import { AuthContext } from './auth-context'
import type { ApiOrg, CredentialsPayload } from './types'

/**
 * Onde a sessão inteira (token incluso) ficava antes do cookie de refresh.
 * Quem logou numa versão antiga ainda tem o token lá; é apagado no boot.
 */
const LEGACY_STORAGE_KEY = 'tailhop.session'

/**
 * Só um aviso de que vale a pena tentar renovar no boot — não carrega token
 * nem dado nenhum. Sem ele, todo visitante, logado ou não, dispararia um
 * refresh a cada página aberta só para ouvir um 401.
 */
const SESSION_HINT_KEY = 'tailhop.has-session'

function readHint(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === '1'
  } catch {
    return false
  }
}

function writeHint(active: boolean) {
  try {
    if (active) localStorage.setItem(SESSION_HINT_KEY, '1')
    else localStorage.removeItem(SESSION_HINT_KEY)
  } catch {
    // Storage bloqueado (aba anônima, cookies de site desligados): a sessão
    // ainda funciona, só não é restaurada no recarregamento.
  }
}

/**
 * Lê o `sub` do JWT sem verificar assinatura — quem valida é a API. Serve só
 * para saber de qual org é a sessão.
 */
function readOrgId(token: string): string | null {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { sub } = JSON.parse(json) as { sub?: string }
    return sub ?? null
  } catch {
    return null
  }
}

async function restoreSession(): Promise<ApiOrg | null> {
  const token = await renewSession().catch(() => null)
  const orgId = token ? readOrgId(token) : null
  if (!orgId) return null
  return fetchOrg(orgId).catch(() => null)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<ApiOrg | null>(null)
  const [restoring, setRestoring] = useState(readHint)

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Sem storage não há sessão antiga para apagar.
    }

    onSessionEnded(() => {
      writeHint(false)
      setOrg(null)
    })

    let cancelled = false

    if (readHint()) {
      // O StrictMode monta duas vezes em desenvolvimento; `renewSession` junta
      // as duas chamadas numa só, então o cookie não gira em dobro.
      restoreSession().then((restored) => {
        if (cancelled) return
        writeHint(restored !== null)
        setOrg(restored)
        setRestoring(false)
      })
    }

    return () => {
      cancelled = true
      onSessionEnded(null)
    }
  }, [])

  const signIn = useCallback(async (credentials: CredentialsPayload) => {
    const token = await authenticateOrg(credentials)

    const orgId = readOrgId(token)
    if (!orgId) throw new Error('O servidor devolveu uma sessão inválida.')

    // O token precisa estar armado antes da próxima chamada: o perfil da ONG
    // já sai autenticado.
    setAuthToken(token)
    const signedIn = await fetchOrg(orgId)

    writeHint(true)
    setOrg(signedIn)
  }, [])

  const signOut = useCallback(async () => {
    // Revoga no servidor antes de limpar aqui: se a chamada falhar, o cookie
    // seguiria vivo e a sessão voltaria no próximo recarregamento. Mesmo
    // assim a tela sai — quem clicou em sair não pode ficar preso logado.
    await signOutOrg().catch(() => {})
    setAuthToken(null)
    writeHint(false)
    setOrg(null)
  }, [])

  const value = useMemo(
    () => ({ org, restoring, signIn, signOut }),
    [org, restoring, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
