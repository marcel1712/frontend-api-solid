import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { buttonClass } from '@/components/button-styles'
import { PasswordField } from '@/components/PasswordField'
import { Button, Callout, Field } from '@/components/ui'
import { ApiError, registerOrg, usingMockData } from '@/lib/api'
import { scorePassword } from '@/lib/password'
import { toE164 } from '@/lib/phone'

/**
 * `address` é exigido pelo `POST /orgs` e faltava aqui — sem ele o cadastro
 * responde 400. `about` saiu: a API não guarda esse campo, e pedir um texto
 * que se perde no envio é desrespeito com quem preenche.
 */
const FIELDS = [
  { name: 'name', label: 'Nome da ONG', type: 'text', autoComplete: 'organization' },
  { name: 'city', label: 'Cidade', type: 'text', autoComplete: 'address-level2' },
  { name: 'address', label: 'Endereço', type: 'text', autoComplete: 'street-address' },
  { name: 'whatsapp', label: 'WhatsApp', type: 'tel', autoComplete: 'tel' },
] as const

export function OrgSignup() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [whatsappError, setWhatsappError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // A senha é conferida no envio, não a cada tecla: corrigir alguém no meio
    // da digitação atrapalha quem ainda está formando a senha.
    if (!scorePassword(password, { email }).valid) {
      setPasswordError('A senha ainda não atende aos requisitos acima.')
      return
    }

    const form = new FormData(event.currentTarget)

    // A API exige E.164; aqui aceitamos o número como se escreve no Brasil.
    const whatsapp = toE164(String(form.get('whatsapp') ?? ''))
    if (!whatsapp) {
      setWhatsappError('Informe um número com DDD, como (11) 98765-4321.')
      return
    }

    setPasswordError(null)
    setWhatsappError(null)
    setError(null)
    setSubmitting(true)

    try {
      await registerOrg({
        name: String(form.get('name') ?? '').trim(),
        city: String(form.get('city') ?? '').trim(),
        address: String(form.get('address') ?? '').trim(),
        whatsapp,
        email: email.trim(),
        password,
      })
      setSent(true)
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 409
          ? 'Já existe uma conta com este e-mail ou WhatsApp.'
          : cause instanceof Error
            ? cause.message
            : 'Não foi possível concluir o cadastro. Tente de novo.',
      )
      setSubmitting(false)
    }
  }

  return (
    <OrgShell
      title="Cadastre sua ONG e alcance mais adotantes"
      subtitle="Publique os pets que você resgata e receba o contato de quem quer adotar direto no WhatsApp da ONG."
      actions={
        <Link
          to="/ong/entrar"
          className={buttonClass({ variant: 'on-brand', size: 'sm' })}
        >
          Entrar
        </Link>
      }
    >
      <Card>
        {sent ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl">Confirme seu e-mail</h2>
            {/* O login recusa conta não verificada, então mandar direto para
                lá seria empurrar a pessoa para uma porta fechada. */}
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              A conta foi criada. Enviamos um link de confirmação para{' '}
              <strong className="font-bold text-ink">{email.trim()}</strong> — abra
              ele para liberar o acesso.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm font-semibold text-ink-soft">
              O link vale 24 horas. Se não chegar, confira a caixa de spam.
            </p>
            <div className="mt-6">
              <Link to="/ong/entrar" className={buttonClass({ variant: 'outline' })}>
                Já confirmei, quero entrar
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {usingMockData ? (
              <Callout icon={<Info className="size-5" aria-hidden />}>
                Modo demonstração: nenhum dado sai do navegador.
              </Callout>
            ) : null}

            {error ? (
              <Callout tone="error" icon={<AlertCircle className="size-5" aria-hidden />}>
                {error}
              </Callout>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <Field
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  required
                  autoComplete={field.autoComplete}
                  hint={field.name === 'whatsapp' ? 'Com DDD. Ex.: (11) 98765-4321' : undefined}
                  error={field.name === 'whatsapp' ? (whatsappError ?? undefined) : undefined}
                  onChange={
                    field.name === 'whatsapp' ? () => setWhatsappError(null) : undefined
                  }
                />
              ))}
              <Field
                label="E-mail de contato"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <PasswordField
              label="Senha de acesso"
              value={password}
              onChange={(value) => {
                setPassword(value)
                setPasswordError(null)
              }}
              context={{ email }}
              error={passwordError ?? undefined}
            />

            <Button type="submit" size="lg" full disabled={submitting}>
              {submitting ? 'Criando conta…' : 'Criar conta'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm font-bold text-ink-soft">
          Já tem conta?{' '}
          <Link to="/ong/entrar" className="rounded-pill text-brand hover:underline">
            Entrar na área da ONG
          </Link>
        </p>
      </Card>
    </OrgShell>
  )
}
