import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  authenticateOrg,
  fetchOwnOrg,
  onSessionEnded,
  renewSession,
  setAuthToken,
  signOutOrg,
} from './api'
import { AuthContext } from './auth-context'
import type { ApiOwnOrg, CredentialsPayload } from './types'

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

async function restoreSession(): Promise<ApiOwnOrg | null> {
  const token = await renewSession().catch(() => null)
  if (!token) return null
  return fetchOwnOrg().catch(() => null)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<ApiOwnOrg | null>(null)
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

    // O token precisa estar armado antes da próxima chamada: o perfil da ONG
    // já sai autenticado.
    setAuthToken(token)
    const signedIn = await fetchOwnOrg()

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

  // O status da verificação muda por fora — a ONG envia um documento, a equipe
  // decide —, então quem mostra o status pode pedir a versão atual.
  const refreshOrg = useCallback(async () => {
    const current = await fetchOwnOrg()
    setOrg(current)
  }, [])

  const value = useMemo(
    () => ({ org, restoring, signIn, signOut, refreshOrg }),
    [org, restoring, signIn, signOut, refreshOrg],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
