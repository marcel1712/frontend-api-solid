import { CheckCircle2, Info } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Footer } from '@/components/SiteChrome'

const FIELDS = [
  { name: 'name', label: 'Nome da ONG', type: 'text', autoComplete: 'organization' },
  { name: 'city', label: 'Cidade', type: 'text', autoComplete: 'address-level2' },
  { name: 'email', label: 'E-mail de contato', type: 'email', autoComplete: 'email' },
  { name: 'whatsapp', label: 'WhatsApp', type: 'tel', autoComplete: 'tel' },
] as const

export function OrgSignup() {
  const [sent, setSent] = useState(false)

  return (
    <>
      <header className="on-brand hero-gradient rounded-b-[2.5rem] px-5 pt-6 pb-16 sm:rounded-b-[3rem] sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="inline-block rounded-2xl" aria-label="Tailhop, ir para a página inicial">
            <Logo variant="on-brand" />
          </Link>
          <h1 className="mt-10 max-w-2xl text-3xl leading-tight text-white sm:text-5xl">
            Cadastre sua ONG e alcance mais adotantes
          </h1>
          <p className="mt-4 max-w-xl font-bold text-white/90">
            Publique os pets que você resgata e receba o contato de quem quer adotar
            direto no WhatsApp da ONG.
          </p>
        </div>
      </header>

      <main className="px-5 sm:px-8">
        <div className="mx-auto -mt-10 max-w-2xl rounded-[2rem] bg-surface p-6 shadow-card sm:p-8">
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
              <button
                type="button"
                onClick={() => {
                  setSent(false)
                }}
                className="mt-6 rounded-pill border-2 border-brand px-6 py-3 font-display font-semibold text-brand transition-colors hover:bg-brand-soft"
              >
                Preencher de novo
              </button>
            </div>
          ) : (
            <form
              noValidate={false}
              onSubmit={(event) => {
                event.preventDefault()
                setSent(true)
              }}
            >
              <p className="flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-sm font-bold text-brand-deep">
                <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
                Projeto de portfólio: o formulário é apenas demonstrativo e nenhum dado é
                enviado.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {FIELDS.map((field) => (
                  <label key={field.name} className="flex flex-col gap-2">
                    <span className="text-sm font-bold">{field.label}</span>
                    <input
                      name={field.name}
                      type={field.type}
                      required
                      autoComplete={field.autoComplete}
                      className="h-12 rounded-2xl border border-hairline bg-canvas px-4 font-semibold outline-hidden focus:border-brand"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-5 flex flex-col gap-2">
                <span className="text-sm font-bold">Sobre a ONG</span>
                <textarea
                  name="about"
                  rows={4}
                  required
                  placeholder="Conte como a ONG trabalha, desde quando existe e como recebe os pets."
                  className="rounded-2xl border border-hairline bg-canvas p-4 font-semibold outline-hidden placeholder:text-ink-soft focus:border-brand"
                />
              </label>

              <button
                type="submit"
                className="mt-7 w-full rounded-pill bg-brand px-6 py-4 font-display text-lg font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                Enviar cadastro
              </button>
            </form>
          )}
        </div>
      </main>

      <div className="mt-16">
        <Footer />
      </div>
    </>
  )
}
