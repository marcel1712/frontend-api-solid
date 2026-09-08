import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { CitySearch } from './CitySearch'
import { Logo } from './Logo'

export const GITHUB_URL = 'https://github.com/marcel1712/api-solid'

/** A lucide não traz mais marcas de terceiros, então o octocat vem inline. */
function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

/**
 * Na home o header não existe até a pessoa passar da hero — a hero é a
 * primeira tela inteira, sem barra por cima. Nas outras telas ele fica fixo
 * desde o início e carrega a busca por cidade junto.
 */
interface HeaderProps {
  revealOnScroll?: boolean
  withSearch?: boolean
  initialCity?: string
}

export function Header({
  revealOnScroll = false,
  withSearch = false,
  initialCity,
}: HeaderProps) {
  const [visible, setVisible] = useState(!revealOnScroll)
  const { org } = useAuth()

  useEffect(() => {
    if (!revealOnScroll) return

    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.75)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [revealOnScroll])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-hairline bg-canvas/90 backdrop-blur transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
      }`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="shrink-0 rounded-2xl" aria-label="Tailhop, ir para a página inicial">
          <Logo />
        </Link>

        {withSearch ? (
          <div className="hidden min-w-0 flex-1 md:flex">
            <CitySearch variant="bar" initialCity={initialCity} />
          </div>
        ) : (
          <span className="flex-1" />
        )}

        <Link
          to={org ? '/ong/painel' : '/ong/entrar'}
          className="shrink-0 rounded-pill px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand-soft"
        >
          {org ? 'Meu painel' : 'Área da ONG'}
        </Link>
      </div>

      {withSearch ? (
        <div className="border-t border-hairline px-5 py-3 md:hidden">
          <CitySearch variant="bar" initialCity={initialCity} />
        </div>
      ) : null}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-hairline px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="text-sm font-bold text-ink-soft">
          Projeto de portfólio — todos os dados são fictícios.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand-soft"
        >
          <GithubMark />
          Repositório no GitHub
        </a>
      </div>
    </footer>
  )
}
