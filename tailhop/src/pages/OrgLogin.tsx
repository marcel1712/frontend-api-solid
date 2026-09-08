import { AlertCircle, Info } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { VerifyNotice } from '@/components/VerifyNotice'
import { Button, Callout, Field } from '@/components/ui'
import { ApiError, usingMockData } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export function OrgLogin() {
  const { org, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [unverified, setUnverified] = useState(false)

  if (org) return <Navigate to="/ong/painel" replace />

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn({ email, password })
      navigate('/ong/painel', { replace: true })
    } catch (cause) {
      // 403 aqui significa conta sem e-mail confirmado — a senha estava certa.
      // A API responde em inglês; a tela diz na língua de quem lê.
      if (cause instanceof ApiError && cause.status === 403) {
        setUnverified(true)
        setSubmitting(false)
        return
      }

      // A API devolve o mesmo erro para e-mail inexistente e senha errada, de
      // propósito. A mensagem aqui acompanha isso e não entrega qual dos dois é.
      setError(
        cause instanceof ApiError && cause.status === 400
          ? 'E-mail ou senha não conferem.'
          : cause instanceof Error
            ? cause.message
            : 'Não foi possível entrar. Tente de novo.',
      )
      setSubmitting(false)
    }
  }

  if (unverified) {
    return (
      <OrgShell title="Falta confirmar o e-mail" subtitle="É o último passo do cadastro.">
        <Card>
          <VerifyNotice email={email.trim()} />
          <div className="mt-2 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setUnverified(false)
              }}
            >
              Tentar com outra conta
            </Button>
          </div>
        </Card>
      </OrgShell>
    )
  }

  return (
    <OrgShell
      title="Entrar na área da ONG"
      subtitle="Publique novos pets e acompanhe quem já está anunciado."
    >
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {usingMockData ? (
            <Callout icon={<Info className="size-5" aria-hidden />}>
              Modo demonstração: não há servidor por trás, então qualquer e-mail
              e senha entram.
            </Callout>
          ) : null}

          {error ? (
            <Callout tone="error" icon={<AlertCircle className="size-5" aria-hidden />}>
              {error}
            </Callout>
          ) : null}

          <Field
            label="E-mail"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            label="Senha"
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit" size="lg" full disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>

          <Link
            to="/esqueci-senha"
            className="self-center rounded-pill text-sm font-bold text-brand hover:underline"
          >
            Esqueci minha senha
          </Link>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-ink-soft">
          Ainda não tem conta?{' '}
          <Link to="/ong" className="rounded-pill text-brand hover:underline">
            Cadastre sua ONG
          </Link>
        </p>
      </Card>
    </OrgShell>
  )
}
