import { AlertCircle, CheckCircle2, MailCheck } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout, Field } from '@/components/ui'
import { resendVerificationEmail, verifyEmail } from '@/lib/api'
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

/** Reenvio, oferecido só quando o link falhou — antes disso não há o que pedir. */
function ResendForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (sent) {
    return (
      <Callout icon={<MailCheck className="size-5" aria-hidden />}>
        Se essa conta existir e ainda não estiver verificada, o link novo já foi
        enviado.
      </Callout>
    )
  }

  return (
    <form
      className="mt-8 flex flex-col gap-4 border-t border-hairline pt-6 text-left"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
          await resendVerificationEmail(email.trim())
          setSent(true)
        } catch (cause) {
          setError(
            cause instanceof Error ? cause.message : 'Não foi possível reenviar agora.',
          )
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <Field
        label="Receber um link novo"
        type="email"
        name="email"
        required
        autoComplete="email"
        hint="Informe o e-mail que você usou no cadastro."
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error ?? undefined}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Reenviar verificação'}
      </Button>
    </form>
  )
}

/**
 * Destino do link de verificação de conta.
 *
 * A verificação dispara sozinha ao abrir: quem clicou no e-mail já expressou a
 * intenção, e pedir mais um clique aqui seria burocracia. O risco conhecido é o
 * antivírus de e-mail corporativo, que abre links para inspecionar e gastaria o
 * token antes da pessoa — o antídoto é o backend tratar "já verificado" como
 * sucesso, e não como erro. Ver a nota no README.
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
          <ResendForm />
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
              Links de verificação servem uma vez só. Se você já confirmou a conta
              antes, é só entrar normalmente.
            </p>
          </Outcome>
          <ResendForm />
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
