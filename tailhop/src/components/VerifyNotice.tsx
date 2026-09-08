import { MailCheck, MailWarning } from 'lucide-react'
import { useState } from 'react'
import { resendVerificationEmail } from '@/lib/api'
import { Button } from './ui'

/**
 * O que a ONG vê enquanto não confirma o e-mail.
 *
 * Não é um erro — ela não fez nada errado, só falta um passo. Por isso o tom é
 * de pendência, com a ação de resolver ao lado, e não um alerta vermelho.
 *
 * `tone="blocking"` é a versão que substitui o cadastro de pet: um botão
 * desabilitado não explica por que está desabilitado, então no lugar dele
 * aparece o motivo e o que fazer.
 */
export function VerifyNotice({
  email,
  tone = 'reminder',
}: {
  email: string
  tone?: 'reminder' | 'blocking'
}) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function resend() {
    setError(null)
    setSending(true)

    try {
      await resendVerificationEmail(email)
      setSent(true)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível reenviar agora.',
      )
    } finally {
      setSending(false)
    }
  }

  const blocking = tone === 'blocking'

  return (
    <div
      className={
        blocking
          ? ''
          : 'flex flex-col gap-4 rounded-3xl bg-brand-soft p-5 sm:flex-row sm:items-center'
      }
    >
      <span
        className={`grid shrink-0 place-items-center rounded-2xl bg-surface text-brand-deep ${
          blocking ? 'size-14' : 'size-12'
        }`}
      >
        {sent ? (
          <MailCheck className={blocking ? 'size-7' : 'size-6'} aria-hidden />
        ) : (
          <MailWarning className={blocking ? 'size-7' : 'size-6'} aria-hidden />
        )}
      </span>

      <div className={blocking ? 'mt-5' : 'flex-1'}>
        <h2 className={blocking ? 'text-2xl' : 'font-display text-lg text-brand-deep'}>
          {sent ? 'Link reenviado' : 'Confirme seu e-mail para publicar'}
        </h2>
        <p
          className={`mt-2 font-semibold ${
            blocking ? 'max-w-md text-ink-soft' : 'text-sm text-brand-deep/80'
          }`}
        >
          {sent
            ? `Mandamos um link novo para ${email}. Confira também a caixa de spam.`
            : `Enviamos um link para ${email}. Enquanto ele não for aberto, seus pets não podem ir para a busca.`}
        </p>
        {error ? (
          <p role="alert" className="mt-2 text-sm font-bold text-brand-deep">
            {error}
          </p>
        ) : null}
      </div>

      {!sent ? (
        <div className={blocking ? 'mt-6' : 'shrink-0'}>
          <Button
            variant={blocking ? 'primary' : 'outline'}
            size={blocking ? 'md' : 'sm'}
            onClick={() => void resend()}
            disabled={sending}
          >
            {sending ? 'Enviando…' : 'Reenviar e-mail'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
