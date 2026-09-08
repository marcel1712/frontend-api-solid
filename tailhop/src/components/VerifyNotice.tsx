import { MailWarning } from 'lucide-react'
import { ResendVerification } from './ResendVerification'

/**
 * O que a ONG vê quando tenta entrar sem ter confirmado o e-mail.
 *
 * Não é erro de credencial — a senha está certa, falta um passo. Por isso o
 * tom é de pendência e não de recusa.
 *
 * O reenvio fica aqui porque este é o momento em que a pessoa descobre o
 * problema — mandá-la procurar outra tela para resolver seria empurrar trabalho.
 */
export function VerifyNotice({ email }: { email: string }) {
  return (
    <div className="py-6 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
        <MailWarning className="size-7" aria-hidden />
      </span>

      <h2 className="mt-5 text-2xl">Confirme seu e-mail para entrar</h2>

      <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
        Enviamos um link para{' '}
        <strong className="font-bold text-ink">{email}</strong> quando a conta foi
        criada. Abra esse link e volte aqui.
      </p>

      <p className="mx-auto mt-3 max-w-sm text-sm font-semibold text-ink-soft">
        Não achou? Veja a caixa de spam — o link vale 24 horas.
      </p>

      <ResendVerification email={email} />
    </div>
  )
}
