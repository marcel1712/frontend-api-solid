import { Link } from 'react-router-dom'
import { Footer, Header } from '@/components/SiteChrome'

export function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-xl place-items-center px-5 pt-40 pb-24 text-center">
        <h1 className="text-4xl">Essa página não existe</h1>
        <p className="mt-4 font-semibold text-ink-soft">
          O endereço que você abriu não leva a lugar nenhum. Volte para a busca e
          encontre pets na sua cidade.
        </p>
        <Link
          to="/pets"
          className="mt-8 rounded-pill bg-brand px-8 py-4 font-display text-lg font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          Ver pets para adoção
        </Link>
      </main>
      <Footer />
    </>
  )
}
