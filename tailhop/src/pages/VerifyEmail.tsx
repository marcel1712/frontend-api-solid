import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { ResendVerification } from '@/components/ResendVerification'
import { buttonClass } from '@/components/button-styles'

import { verifyEmail } from '@/lib/api'
import { useRequest } from '@/lib/useRequest'

/** Bloco central das três saídas da tela, para elas ficarem idênticas em peso. */
function Outcome({
  icon,
  title,
  children,
  actions,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="py-6 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
        {icon}
      </span>
      <h2 className="mt-5 text-2xl">{title}</h2>
      <div className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">{children}</div>
      {actions ? (
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{actions}</div>
      ) : null}
    </div>
  )
}

/**
 * Destino do link de verificação de conta.
 *
 * A verificação dispara sozinha ao abrir: quem clicou no e-mail já expressou a
 * intenção, e pedir mais um clique aqui seria burocracia. O risco conhecido é o
 * antivírus de e-mail corporativo, que abre links para inspecionar. O backend
 * fechou esse buraco: reusar um token que já verificou responde 200, então o
 * scanner não queima mais a conta de ninguém.
 */
export function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const { loading, error } = useRequest(
    useCallback(() => verifyEmail(token), [token]),
    { enabled: token !== '' },
  )

  if (!token) {
    return (
      <OrgShell title="Verificar e-mail" subtitle="O link parece incompleto.">
        <Card>
          <Outcome
            icon={<AlertCircle className="size-7" aria-hidden />}
            title="Este link está incompleto"
            actions={
              <Link to="/ong/entrar" className={buttonClass({ variant: 'outline' })}>
                Ir para o login
              </Link>
            }
          >
            <p>
              Abra o link direto do e-mail que enviamos, sem copiar só um pedaço
              dele.
            </p>
          </Outcome>
          <ResendVerification />
        </Card>
      </OrgShell>
    )
  }

  if (loading) {
    return (
      <OrgShell title="Verificando…" subtitle="Isso leva um instante.">
        <Card>
          <div className="flex flex-col items-center gap-4 py-10" aria-busy>
            <div className="size-14 animate-pulse rounded-2xl bg-shell" />
            <div className="h-6 w-52 animate-pulse rounded-pill bg-shell" />
            <div className="h-4 w-72 animate-pulse rounded-pill bg-shell" />
          </div>
        </Card>
      </OrgShell>
    )
  }

  if (error) {
    return (
      <OrgShell title="Não deu para verificar" subtitle="O link pode ter expirado.">
        <Card>
          <Outcome
            icon={<AlertCircle className="size-7" aria-hidden />}
            title="Este link não vale mais"
            actions={
              <Link to="/ong/entrar" className={buttonClass({ variant: 'outline' })}>
                Ir para o login
              </Link>
            }
          >
            <p>{error}</p>
            <p className="mt-3 text-sm">
              O link vale 24 horas. Se a conta já estava confirmada, é só entrar
              normalmente.
            </p>
          </Outcome>
          <ResendVerification />
        </Card>
      </OrgShell>
    )
  }

  return (
    <OrgShell title="Conta verificada" subtitle="Tudo pronto para publicar pets.">
      <Card>
        <Outcome
          icon={<CheckCircle2 className="size-7" aria-hidden />}
          title="E-mail confirmado"
          actions={
            <Link to="/ong/entrar" className={buttonClass()}>
              Entrar na área da ONG
            </Link>
          }
        >
          <p>
            Sua conta está ativa. Agora dá para publicar os pets que a ONG resgata
            e receber o contato de quem quer adotar.
          </p>
        </Outcome>
      </Card>
    </OrgShell>
  )
}
