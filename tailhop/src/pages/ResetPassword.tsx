import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { PasswordField } from '@/components/PasswordField'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout } from '@/components/ui'
import { ApiError, resetPassword } from '@/lib/api'
import { scorePassword } from '@/lib/password'

/**
 * Destino do link enviado por e-mail. O caminho `/reset-password?token=` é
 * ditado pelo backend, que monta a URL em `requestPasswordResetUseCase` — por
 * isso esta rota é a única em inglês do site.
 */
export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  // Dois erros distintos: o da senha fraca pertence ao campo, o de rede à tela.
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!scorePassword(password).valid) {
      setPasswordError('A senha ainda não atende aos requisitos acima.')
      return
    }

    setPasswordError(null)
    setError(null)
    setSubmitting(true)

    try {
      await resetPassword({ token, password })
      setDone(true)
    } catch (cause) {
      // A API devolve 400 tanto para token inválido quanto expirado, e a saída
      // é a mesma nos dois casos: pedir um link novo.
      if (cause instanceof ApiError && cause.status === 400) {
        setExpired(true)
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível trocar a senha. Tente de novo.',
        )
      }
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <OrgShell title="Senha atualizada" subtitle="Já dá para entrar com ela.">
        <Card>
          <div className="py-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl">Pronto</h2>
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              Sua senha foi trocada. O link antigo não funciona mais.
            </p>
            <Link to="/ong/entrar" className={`${buttonClass()} mt-7`}>
              Entrar na área da ONG
            </Link>
          </div>
        </Card>
      </OrgShell>
    )
  }

  if (!token || expired) {
    return (
      <OrgShell title="Link inválido" subtitle="Peça outro para continuar.">
        <Card>
          <div className="py-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
              <AlertCircle className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl">
              {token ? 'Este link expirou ou já foi usado' : 'Este link está incompleto'}
            </h2>
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              {token
                ? 'Links de recuperação valem por uma hora e servem uma vez só.'
                : 'Abra o link direto do e-mail, sem copiar pedaços dele.'}
            </p>
            <Link to="/esqueci-senha" className={`${buttonClass()} mt-7`}>
              Pedir um link novo
            </Link>
          </div>
        </Card>
      </OrgShell>
    )
  }

  return (
    <OrgShell
      title="Criar uma senha nova"
      subtitle="Escolha uma que você não use em outro lugar."
    >
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <PasswordField
            label="Nova senha"
            value={password}
            onChange={(value) => {
              setPassword(value)
              setPasswordError(null)
            }}
            error={passwordError ?? undefined}
          />

          {error ? (
            <Callout tone="error" icon={<AlertCircle className="size-5" aria-hidden />}>
              {error}
            </Callout>
          ) : null}

          <Button type="submit" size="lg" full disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
        </form>
      </Card>
    </OrgShell>
  )
}
