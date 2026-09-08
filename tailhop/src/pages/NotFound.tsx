import { Link } from 'react-router-dom'
import { Footer, Header } from '@/components/SiteChrome'
import { buttonClass } from '@/components/button-styles'

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
          className={`${buttonClass({ size: 'lg' })} mt-8`}
        >
          Ver pets para adoção
        </Link>
      </main>
      <Footer />
    </>
  )
}
