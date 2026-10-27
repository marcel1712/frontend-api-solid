import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Footer, Header } from './SiteChrome'

export interface LegalSection {
  id: string
  title: string
  content: ReactNode
}

interface LegalPageProps {
  title: string
  intro: ReactNode
  updatedAt: string
  sections: LegalSection[]
  /** A outra página legal, para quem leu uma achar a outra. */
  related: { to: string; label: string }
}

/**
 * Texto longo para ser lido de verdade: coluna estreita, sumário com âncoras e
 * títulos numerados, para que um pedido possa citar "item 6" sem ambiguidade.
 */
export function LegalPage({ title, intro, updatedAt, sections, related }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="px-5 pt-28 pb-20 sm:px-8">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm font-bold text-ink-soft">Atualizado em {updatedAt}</p>
          <div className="mt-6 text-lg leading-relaxed font-semibold text-ink-soft">{intro}</div>

          <nav
            aria-label="Nesta página"
            className="mt-10 rounded-[2rem] bg-surface p-6 shadow-card sm:p-8"
          >
            <p className="font-display text-lg">Nesta página</p>
            <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="rounded-sm text-sm font-bold text-brand hover:underline"
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="mt-12 scroll-mt-24">
              <h2 className="text-2xl">
                {index + 1}. {section.title}
              </h2>
              <div className="legal-prose mt-4">{section.content}</div>
            </section>
          ))}

          <p className="mt-16 border-t border-hairline pt-6 text-sm font-bold text-ink-soft">
            Veja também:{' '}
            <Link to={related.to} className="text-brand hover:underline">
              {related.label}
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  )
}
