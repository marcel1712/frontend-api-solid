import { MapPin, MessageCircle, SlidersHorizontal } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import dog from '@/assets/dog.png'
import { CitySearch } from '@/components/CitySearch'
import { Logo } from '@/components/Logo'
import { PetCard, PetCardSkeleton } from '@/components/PetCard'
import { Footer, Header } from '@/components/SiteChrome'
import { fetchFeaturedPets } from '@/lib/api'
import { useRequest } from '@/lib/useRequest'

/** Os três passos são uma sequência de verdade, então numerá-los é informação. */
const STEPS = [
  { icon: MapPin, text: 'Busque pets na sua cidade' },
  { icon: SlidersHorizontal, text: 'Veja detalhes e filtre por características' },
  { icon: MessageCircle, text: 'Fale direto com a ONG pelo WhatsApp' },
]

function Featured() {
  const { data, loading, error, reload } = useRequest(
    useCallback(() => fetchFeaturedPets(4), []),
  )

  if (loading) {
    return (
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <PetCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-10 rounded-3xl bg-surface p-8 text-center shadow-card">
        <p className="font-semibold text-ink-soft">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-4 rounded-pill bg-brand px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          Tentar de novo
        </button>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <p className="mt-10 rounded-3xl bg-surface p-8 text-center font-semibold text-ink-soft shadow-card">
        Ainda não há pets publicados. Busque pela sua cidade para conferir de novo.
      </p>
    )
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  )
}

export function Home() {
  return (
    <>
      <Header revealOnScroll />

      <main>
        <section className="on-brand hero-gradient relative overflow-hidden rounded-b-[2.5rem] px-5 pt-6 pb-14 sm:rounded-b-[4rem] sm:px-8 lg:min-h-[92vh]">
          <div className="mx-auto flex max-w-6xl flex-col lg:min-h-[86vh]">
            <Logo variant="on-brand" size="lg" />

            <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-16">
              <div>
                <h1 className="max-w-xl text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                  Toda pata merece um novo lar
                </h1>
                <p className="mt-5 text-base font-bold text-white/90 sm:text-xl">
                  Conectando pets a famílias
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link
                    to="/pets"
                    className="inline-flex items-center justify-center rounded-pill bg-teal px-8 py-4 font-display text-lg font-semibold text-ink shadow-lift transition-colors hover:bg-teal-deep"
                  >
                    Adotar
                  </Link>
                  <Link
                    to="/ong"
                    className="inline-flex items-center justify-center rounded-pill border-2 border-white/70 px-8 py-4 font-display text-lg font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    Cadastrar ONG
                  </Link>
                </div>
              </div>

              <img
                src={dog}
                alt="Filhote de corgi sentado, olhando para cima"
                width={411}
                height={607}
                className="mx-auto w-full max-w-3xs drop-shadow-2xl lg:max-w-sm"
              />
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <CitySearch />
          </div>
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl sm:text-4xl">Como funciona</h2>
            <ol className="mt-10 grid gap-5 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, text }, index) => (
                <li
                  key={text}
                  className="flex flex-col items-start gap-4 rounded-3xl bg-surface p-6 shadow-card"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-display text-sm text-ink-soft">
                    Passo {index + 1}
                  </span>
                  <p className="font-display text-lg">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl">Pets em destaque</h2>
                <p className="mt-2 font-bold text-ink-soft">
                  Alguns amigos que já estão esperando por você
                </p>
              </div>
              <Link
                to="/pets"
                className="shrink-0 justify-self-start rounded-pill border-2 border-brand px-6 py-3 font-display font-semibold text-brand transition-colors hover:bg-brand-soft"
              >
                Ver todos
              </Link>
            </div>

            <Featured />
          </div>
        </section>

        <section className="bg-shell px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl">Para ONGs</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed font-semibold text-ink-soft sm:text-lg">
              Ganhe visibilidade para os pets que você resgata, gerencie os anúncios de
              forma simples e receba o contato dos adotantes direto no WhatsApp da ONG.
            </p>
            <Link
              to="/ong"
              className="mt-9 inline-flex rounded-pill bg-brand px-8 py-4 font-display text-lg font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              Cadastre sua ONG
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
