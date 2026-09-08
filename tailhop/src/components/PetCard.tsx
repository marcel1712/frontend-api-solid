import { MapPin, PawPrint } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatAge, formatSize, formatType, whatsappLink } from '@/lib/format'
import type { Pet } from '@/lib/types'
import { buttonClass } from './button-styles'

/**
 * Sem foto publicada, o lugar dela recebe um ladrilho da marca em vez de uma
 * imagem genérica de banco. O tom vem do id, então cada pet fica com o seu e a
 * grade não vira um bloco chapado.
 */
const TILES = [
  'from-brand-soft to-[#ffd0e2]',
  'from-[#e6faf6] to-[#c7f2ea]',
  'from-[#fff0d8] to-[#ffe0bd]',
  'from-[#efe9fb] to-[#ded3f7]',
]

export function PetPhoto({
  pet,
  className = 'aspect-4/3',
}: {
  pet: Pet
  className?: string
}) {
  const [photo] = pet.photos

  if (photo) {
    return (
      <img
        src={photo.url}
        alt={`Foto de ${pet.name}`}
        loading="lazy"
        className={`size-full object-cover ${className}`}
      />
    )
  }

  const tile = TILES[[...pet.id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % TILES.length]

  return (
    <div
      className={`grid place-items-center bg-linear-to-br ${tile} ${className}`}
      role="img"
      aria-label={`${pet.name} ainda não tem foto publicada`}
    >
      <PawPrint className="size-14 text-ink/25" strokeWidth={2.25} aria-hidden />
    </div>
  )
}

/**
 * O card leva à página do pet, e o botão de adotar continua abrindo o WhatsApp
 * direto para quem já decidiu.
 *
 * Só o nome é link de verdade; o `after:` estica a área clicável até o card
 * inteiro sem aninhar interativos. Ficam dois pontos de tabulação — nome e
 * adotar — em vez de um link envolvendo um botão, que nenhum leitor de tela
 * anuncia direito.
 */
export function PetCard({ pet }: { pet: Pet }) {
  const contact = whatsappLink(pet)

  return (
    <article className="relative flex flex-col overflow-hidden rounded-3xl bg-surface shadow-card transition-shadow hover:shadow-lift">
      <PetPhoto pet={pet} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-display text-xl">
            <Link
              to={`/pets/${pet.id}`}
              className="rounded-sm after:absolute after:inset-0 after:content-['']"
            >
              {pet.name}
            </Link>
          </h3>
          <span className="shrink-0 rounded-pill bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep">
            {formatType(pet.type)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-pill bg-shell px-2.5 py-1 text-xs font-bold text-ink-soft">
            {formatAge(pet.age)}
          </span>
          <span className="rounded-pill bg-shell px-2.5 py-1 text-xs font-bold text-ink-soft">
            {formatSize(pet.size)}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-sm font-bold text-ink-soft">
          <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
          {pet.city}
        </p>

        {pet.bio ? (
          <p className="line-clamp-2 text-sm leading-relaxed font-semibold text-ink-soft">
            {pet.bio}
          </p>
        ) : null}

        {/* `relative` para ficar acima do `after:` do card; sem isso o clique
            aqui cairia no link do nome. */}
        {contact ? (
          <a
            href={contact}
            target="_blank"
            rel="noreferrer"
            aria-label={`Adotar ${pet.name}: falar com a ONG no WhatsApp`}
            className={`${buttonClass()} relative mt-auto`}
          >
            Adotar
          </a>
        ) : (
          <p className="relative mt-auto rounded-pill bg-shell px-5 py-3 text-center text-sm font-bold text-ink-soft">
            Contato da ONG indisponível
          </p>
        )}
      </div>
    </article>
  )
}

export function PetCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface shadow-card" aria-hidden>
      <div className="aspect-4/3 animate-pulse bg-shell" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-6 w-2/3 animate-pulse rounded-pill bg-shell" />
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-pill bg-shell" />
          <div className="h-5 w-24 animate-pulse rounded-pill bg-shell" />
        </div>
        <div className="h-4 w-1/2 animate-pulse rounded-pill bg-shell" />
        <div className="h-11 animate-pulse rounded-pill bg-shell" />
      </div>
    </div>
  )
}
