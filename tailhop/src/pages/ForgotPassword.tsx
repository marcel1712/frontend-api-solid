import { AlertCircle, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout, Field } from '@/components/ui'
import { requestPasswordReset } from '@/lib/api'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível enviar o link agora. Tente de novo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OrgShell
      title="Recuperar acesso"
      subtitle="Enviamos um link para você criar uma senha nova."
    >
      <Card>
        {sent ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
              <MailCheck className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl">Confira seu e-mail</h2>
            {/* A API responde igual para e-mail cadastrado ou não, para não
                revelar quais contas existem. A tela precisa dizer o mesmo. */}
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              Se <strong className="font-bold text-ink">{email.trim()}</strong>{' '}
              estiver cadastrado, o link de recuperação já está a caminho. Ele vale
              por uma hora.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm font-semibold text-ink-soft">
              Não chegou? Veja a caixa de spam antes de pedir outro.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/ong/entrar" className={buttonClass()}>
                Voltar para o login
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false)
                }}
              >
                Usar outro e-mail
              </Button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error ? (
                <Callout
                  tone="error"
                  icon={<AlertCircle className="size-5" aria-hidden />}
                >
                  {error}
                </Callout>
              ) : null}

              <Field
                label="E-mail da ONG"
                type="email"
                name="email"
                required
                autoComplete="email"
                hint="O mesmo que você usa para entrar."
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Button type="submit" size="lg" full disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar link de recuperação'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm font-bold text-ink-soft">
              Lembrou a senha?{' '}
              <Link to="/ong/entrar" className="rounded-pill text-brand hover:underline">
                Entrar
              </Link>
            </p>
          </>
        )}
      </Card>
    </OrgShell>
  )
}
