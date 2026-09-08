import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { Footer } from './SiteChrome'

/**
 * Cabeçalho em gradiente da área da ONG. Mais compacto que a hero da home:
 * aqui a pessoa veio resolver uma tarefa, não ser convencida de nada.
 */
interface OrgShellProps {
  title: string
  subtitle?: string
  /** Ações no topo direito, como sair da conta. */
  actions?: React.ReactNode
  children: React.ReactNode
}

export function OrgShell({ title, subtitle, actions, children }: OrgShellProps) {
  return (
    <>
      <header className="on-brand hero-gradient rounded-b-[2.5rem] px-5 pt-6 pb-16 sm:rounded-b-[3rem] sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-block rounded-2xl"
              aria-label="Tailhop, ir para a página inicial"
            >
              <Logo variant="on-brand" />
            </Link>
            {actions}
          </div>

          <h1 className="mt-10 max-w-2xl text-3xl leading-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-xl font-bold text-white/90">{subtitle}</p>
          ) : null}
        </div>
      </header>

      <main className="px-5 sm:px-8">
        <div className="mx-auto -mt-10 max-w-3xl">{children}</div>
      </main>

      <div className="mt-16">
        <Footer />
      </div>
    </>
  )
}

/** Cartão branco que flutua sobre o gradiente. */
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-surface p-6 shadow-card sm:p-8">{children}</div>
  )
}
