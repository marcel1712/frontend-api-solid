import { useCallback, useEffect, useState } from 'react'
import { ApiError } from './api'

export interface RequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

interface Settled<T> {
  /** Qual execução produziu este resultado. */
  run: () => Promise<T>
  nonce: number
  data: T | null
  error: string | null
}

/**
 * Estados de loading/erro para uma chamada de rede, em um lugar só.
 *
 * `run` precisa vir memoizado (`useCallback`) com os filtros nas dependências:
 * é a identidade dele que diz qual busca está valendo. O loading é derivado
 * dessa comparação, então trocar de filtro já mostra o skeleton no mesmo
 * render, sem passar por um estado intermediário. Resultados de buscas
 * abandonadas no meio do caminho são descartados.
 */
export function useRequest<T>(
  run: () => Promise<T>,
  { enabled = true }: { enabled?: boolean } = {},
): RequestState<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => {
    setNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return

    let active = true

    run()
      .then((data) => {
        if (active) setSettled({ run, nonce, data, error: null })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setSettled({
          run,
          nonce,
          data: null,
          error:
            cause instanceof ApiError
              ? cause.message
              : 'Algo deu errado por aqui. Tente de novo.',
        })
      })

    return () => {
      active = false
    }
  }, [run, nonce, enabled])

  const fresh = settled?.run === run && settled.nonce === nonce

  if (!enabled) return { data: null, loading: false, error: null, reload }
  if (!fresh) return { data: null, loading: true, error: null, reload }

  return { data: settled.data, loading: false, error: settled.error, reload }
}
