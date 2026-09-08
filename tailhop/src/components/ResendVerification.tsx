import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { resendVerificationEmail } from '@/lib/api'
import { Button, Callout, Field } from './ui'

/**
 * Pedir outro link de verificação.
 *
 * Com o e-mail conhecido — o login sabe quem tentou entrar — é só um botão.
 * Chegando pelo link expirado não há como saber de quem é a conta, então o
 * campo aparece.
 *
 * A confirmação é a mesma para conta inexistente, já verificada ou pendente,
 * acompanhando a API, que responde 200 nos três casos justamente para não
 * revelar quais e-mails estão cadastrados.
 */
export function ResendVerification({ email: known }: { email?: string }) {
  const [email, setEmail] = useState(known ?? '')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function send() {
    setError(null)
    setSending(true)

    try {
      await resendVerificationEmail(email.trim())
      setSent(true)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível reenviar agora.',
      )
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <Callout icon={<MailCheck className="size-5" aria-hidden />}>
        Se essa conta existir e ainda não estiver confirmada, o link novo já foi
        enviado. Ele vale 24 horas.
      </Callout>
    )
  }

  if (known) {
    return (
      <div className="mt-6">
        <Button onClick={() => void send()} disabled={sending}>
          {sending ? 'Enviando…' : 'Reenviar o link'}
        </Button>
        {error ? (
          <p role="alert" className="mt-3 text-sm font-bold text-brand-deep">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <form
      className="mt-8 flex flex-col gap-4 border-t border-hairline pt-6 text-left"
      onSubmit={(event) => {
        event.preventDefault()
        void send()
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
      <Button type="submit" disabled={sending}>
        {sending ? 'Enviando…' : 'Reenviar verificação'}
      </Button>
    </form>
  )
}
