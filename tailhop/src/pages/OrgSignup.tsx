import { CheckCircle2, Info } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout, Field, TextAreaField } from '@/components/ui'

const FIELDS = [
  { name: 'name', label: 'Nome da ONG', type: 'text', autoComplete: 'organization' },
  { name: 'city', label: 'Cidade', type: 'text', autoComplete: 'address-level2' },
  { name: 'email', label: 'E-mail de contato', type: 'email', autoComplete: 'email' },
  { name: 'whatsapp', label: 'WhatsApp', type: 'tel', autoComplete: 'tel' },
] as const

export function OrgSignup() {
  const [sent, setSent] = useState(false)

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
            <h2 className="mt-5 text-2xl">Cadastro recebido</h2>
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              Este é um projeto de portfólio, então nada foi salvo de verdade. Em
              produção, a ONG já entraria na plataforma e poderia publicar pets.
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false)
                }}
              >
                Preencher de novo
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSent(true)
            }}
            className="flex flex-col gap-5"
          >
            <Callout icon={<Info className="size-5" aria-hidden />}>
              Projeto de portfólio: o formulário é apenas demonstrativo e nenhum
              dado é enviado.
            </Callout>

            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <Field
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  required
                  autoComplete={field.autoComplete}
                />
              ))}
            </div>

            <TextAreaField
              label="Sobre a ONG"
              name="about"
              rows={4}
              required
              placeholder="Conte como a ONG trabalha, desde quando existe e como recebe os pets."
            />

            <Button type="submit" size="lg" full>
              Enviar cadastro
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
