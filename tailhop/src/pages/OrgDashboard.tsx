import { AlertCircle, MapPin, Plus } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { PetCardSkeleton } from '@/components/PetCard'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout } from '@/components/ui'
import { fetchOrgPets } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatAge, formatSize, formatType } from '@/lib/format'
import type { ApiOrg, Pet } from '@/lib/types'
import { useRequest } from '@/lib/useRequest'

/** Linha compacta: no painel a ONG confere o que publicou, não navega vitrine. */
function PetRow({ pet }: { pet: Pet }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hairline py-4 first:border-t-0 first:pt-0">
      <span className="font-display text-lg">{pet.name}</span>
      <span className="rounded-pill bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep">
        {formatType(pet.type)}
      </span>
      <span className="rounded-pill bg-shell px-2.5 py-1 text-xs font-bold text-ink-soft">
        {formatAge(pet.age)}
      </span>
      <span className="rounded-pill bg-shell px-2.5 py-1 text-xs font-bold text-ink-soft">
        {formatSize(pet.size)}
      </span>
      <span className="ml-auto flex items-center gap-1.5 text-sm font-bold text-ink-soft">
        <MapPin className="size-4 text-brand" aria-hidden />
        {pet.city}
      </span>
    </li>
  )
}

function PublishedPets({ org }: { org: ApiOrg }) {
  const { data, loading, error, reload } = useRequest(
    useCallback(() => fetchOrgPets(org), [org]),
  )

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <PetCardSkeleton />
        <PetCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <Callout tone="error" icon={<AlertCircle className="size-5" aria-hidden />}>
          {error}
        </Callout>
        <div className="mt-4">
          <Button variant="outline" onClick={reload}>
            Tentar de novo
          </Button>
        </div>
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card>
        <h2 className="text-2xl">Nenhum pet publicado ainda</h2>
        <p className="mt-3 max-w-md font-semibold text-ink-soft">
          Assim que você cadastrar o primeiro, ele aparece na busca de quem
          procura adotar em {org.city}.
        </p>
        <Link to="/ong/painel/novo-pet" className={`${buttonClass()} mt-6`}>
          <Plus className="size-5" aria-hidden />
          Cadastrar pet
        </Link>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl">Pets publicados</h2>
        <p className="text-sm font-bold text-ink-soft">
          {data.length} {data.length === 1 ? 'anunciado' : 'anunciados'}
        </p>
      </div>
      <ul className="mt-5">
        {data.map((pet) => (
          <PetRow key={pet.id} pet={pet} />
        ))}
      </ul>
      <p className="mt-5 text-sm font-semibold text-ink-soft">
        Pets já marcados como adotados saem desta lista, porque deixam de
        aparecer na busca.
      </p>
    </Card>
  )
}

export function OrgDashboard() {
  const { org, signOut } = useAuth()
  if (!org) return null

  return (
    <OrgShell
      title={org.name}
      subtitle={`Área da ONG — ${org.city}`}
      actions={
        <Button variant="on-brand" size="sm" onClick={signOut}>
          Sair
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-sm">
              <h2 className="text-2xl">Publicar um pet</h2>
              <p className="mt-2 font-semibold text-ink-soft">
                Quanto mais detalhes, mais fácil para alguém se reconhecer no
                anúncio.
              </p>
            </div>
            <Link to="/ong/painel/novo-pet" className={buttonClass()}>
              <Plus className="size-5" aria-hidden />
              Cadastrar pet
            </Link>
          </div>
        </Card>

        <PublishedPets org={org} />
      </div>
    </OrgShell>
  )
}
