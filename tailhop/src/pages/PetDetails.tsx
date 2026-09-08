import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PetPhoto } from '@/components/PetCard'
import { Footer, Header } from '@/components/SiteChrome'
import { buttonClass } from '@/components/button-styles'
import { Button } from '@/components/ui'
import { fetchPetPage } from '@/lib/api'
import { formatAge, formatSize, formatType, whatsappLink } from '@/lib/format'
import type { Pet, PetPage } from '@/lib/types'
import { useRequest } from '@/lib/useRequest'

/**
 * Galeria só aparece quando há mais de uma foto — uma linha de miniaturas sob
 * uma única imagem seria enfeite.
 */
function Gallery({ pet }: { pet: Pet }) {
  const [active, setActive] = useState(0)
  const photos = pet.photos

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-[2rem] bg-shell">
        {photos.length ? (
          <img
            src={photos[active].url}
            alt={`Foto de ${pet.name}`}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <PetPhoto pet={pet} className="aspect-square" />
        )}
      </div>

      {photos.length > 1 ? (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Ver foto ${index + 1} de ${photos.length}`}
              aria-current={index === active}
              onClick={() => {
                setActive(index)
              }}
              className={`size-18 overflow-hidden rounded-2xl transition-opacity ${
                index === active ? 'ring-2 ring-brand' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img src={photo.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-pill bg-shell px-3 py-1.5 text-sm font-bold text-ink-soft">
      {children}
    </span>
  )
}

export function PetDetails() {
  const { id = '' } = useParams()
  const { data, loading, error, reload } = useRequest(
    useCallback(() => fetchPetPage(id), [id]),
  )

  return (
    <>
      <Header withSearch />

      <main className="mx-auto max-w-5xl px-5 pt-36 pb-16 sm:px-8 md:pt-28">
        {loading ? (
          <div className="grid gap-8 lg:grid-cols-2" aria-busy>
            <div className="aspect-square animate-pulse rounded-[2rem] bg-shell" />
            <div className="flex flex-col gap-4">
              <div className="h-10 w-2/3 animate-pulse rounded-pill bg-shell" />
              <div className="h-6 w-1/3 animate-pulse rounded-pill bg-shell" />
              <div className="h-32 animate-pulse rounded-3xl bg-shell" />
              <div className="h-14 animate-pulse rounded-pill bg-shell" />
            </div>
          </div>
        ) : error || !data ? (
          <div className="rounded-3xl bg-surface p-10 text-center shadow-card">
            <h1 className="text-2xl">Este pet não está mais anunciado</h1>
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              {error ?? 'Talvez ele já tenha encontrado um lar.'}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/pets" className={buttonClass()}>
                Ver outros pets
              </Link>
              <Button variant="outline" onClick={reload}>
                Tentar de novo
              </Button>
            </div>
          </div>
        ) : (
          <PetContent page={data} />
        )}
      </main>

      <Footer />
    </>
  )
}

function PetContent({ page }: { page: PetPage }) {
  const { pet, org } = page
  const contact = whatsappLink(pet)

  return (
    <>
      <Link
        to="/pets"
        className="inline-flex items-center gap-2 rounded-pill py-2 text-sm font-bold text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para a busca
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <Gallery pet={pet} />

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl sm:text-5xl">{pet.name}</h1>
            <span className="rounded-pill bg-brand-soft px-3 py-1 text-sm font-bold text-brand-deep">
              {formatType(pet.type)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Chip>{formatAge(pet.age)}</Chip>
            <Chip>{formatSize(pet.size)}</Chip>
            {pet.city ? (
              <span className="flex items-center gap-1.5 rounded-pill bg-shell px-3 py-1.5 text-sm font-bold text-ink-soft">
                <MapPin className="size-4 text-brand" aria-hidden />
                {pet.city}
              </span>
            ) : null}
          </div>

          {/* A bio inteira: é justamente o que não cabia no card. */}
          {pet.bio ? (
            <div className="mt-8">
              <h2 className="text-xl">Sobre {pet.name}</h2>
              <p className="mt-3 max-w-prose leading-relaxed font-semibold text-ink-soft">
                {pet.bio}
              </p>
            </div>
          ) : (
            <p className="mt-8 max-w-prose leading-relaxed font-semibold text-ink-soft">
              A ONG ainda não escreveu uma descrição. Pergunte a ela sobre o
              temperamento e a rotina de {pet.name}.
            </p>
          )}

          {org ? (
            <div className="mt-8 rounded-3xl bg-surface p-5 shadow-card">
              <h2 className="text-xl">Quem cuida de {pet.name}</h2>
              <p className="mt-2 font-bold">{org.name}</p>
              <p className="mt-1 text-sm font-semibold text-ink-soft">
                {org.address}
                {org.city ? ` — ${org.city}` : ''}
              </p>
            </div>
          ) : null}

          <div className="mt-8">
            {contact ? (
              <>
                <a
                  href={contact}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ size: 'lg', full: true })}
                >
                  <MessageCircle className="size-5" aria-hidden />
                  Falar com a ONG no WhatsApp
                </a>
                <p className="mt-3 text-center text-sm font-semibold text-ink-soft">
                  A conversa acontece direto com a ONG, fora do Tailhop.
                </p>
              </>
            ) : (
              <p className="rounded-pill bg-shell px-5 py-4 text-center font-bold text-ink-soft">
                Esta ONG ainda não cadastrou um WhatsApp para contato.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
