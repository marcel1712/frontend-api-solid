import type { Breadcrumb, ErrorEvent } from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

const stripQuery = (url: string) => url.split('?')[0]

/**
 * Os links de confirmação de e-mail e de troca de senha levam o token na
 * URL (`/verify-email?token=…`, `/reset-password?token=…`). Nenhum relatório
 * sai com ele: a query string some do endereço da página e de cada rastro de
 * navegação ou de chamada à API.
 */
function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.url) event.request.url = stripQuery(event.request.url)
  if (event.request) {
    delete event.request.query_string
    delete event.request.headers
    delete event.request.cookies
  }
  delete event.user
  return event
}

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (!breadcrumb.data) return breadcrumb

  const data = { ...breadcrumb.data }
  for (const key of ['url', 'from', 'to']) {
    if (typeof data[key] === 'string') data[key] = stripQuery(data[key])
  }
  return { ...breadcrumb, data }
}

/**
 * Liga o Sentry depois que a página terminou de abrir, num pedaço separado do
 * pacote: quem só procura um pet não paga o carregamento dele na primeira
 * tela. Um erro nos primeiros instantes escapa — troca aceitável, porque os
 * erros de servidor já são capturados pela API.
 *
 * Sem `VITE_SENTRY_DSN` (desenvolvimento) não faz nada.
 */
export function startMonitoring() {
  if (!DSN) return

  const load = () =>
    void import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        environment: import.meta.env.MODE,
        // Só erros: nada de desempenho nem gravação de sessão, e nenhum dado
        // de quem navega — sem IP, cookies, cabeçalhos ou corpos.
        dataCollection: {
          userInfo: false,
          cookies: false,
          httpHeaders: false,
          httpBodies: [],
          urlQueryParams: false,
          stackFrameVariables: false,
        },
        beforeSend: scrubEvent,
        beforeBreadcrumb: scrubBreadcrumb,
      })
    })

  if (document.readyState === 'complete') load()
  else window.addEventListener('load', load, { once: true })
}
