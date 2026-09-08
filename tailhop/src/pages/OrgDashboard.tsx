import { AlertCircle, Check, MapPin, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { PetCardSkeleton, PetPhoto } from '@/components/PetCard'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout } from '@/components/ui'
import { ApiError, fetchOrgPets, setPetAdopted } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatAge, formatSize, formatType } from '@/lib/format'
import type { ApiOrg, Pet } from '@/lib/types'
import { useRequest } from '@/lib/useRequest'

interface PetRowProps {
  pet: Pet
  onChanged: (pet: Pet, adopted: boolean) => void
  onUnauthorized: () => void
}

/**
 * Uma linha por pet: no painel a ONG confere e dá baixa no que publicou, não
 * navega pela vitrine.
 *
 * Dar baixa continua pedindo confirmação, porque tira o pet da busca na hora,
 * mas agora é reversível: `GET /orgs/me/pets` devolve os adotados, então existe
 * uma tela de onde reabrir. Reabrir não confirma — é a ação que desfaz.
 */
function PetRow({ pet, onChanged, onUnauthorized }: PetRowProps) {
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function apply(adopted: boolean) {
    setSaving(true)
    setError(null)

    try {
      await setPetAdopted(pet.id, adopted)
      onChanged(pet, adopted)
    } catch (cause) {
      if (cause instanceof ApiError && cause.isUnauthorized) {
        onUnauthorized()
        return
      }
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível atualizar este anúncio.',
      )
      setSaving(false)
      setConfirming(false)
    }
  }

  return (
    <li className="border-t border-hairline py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          to={`/ong/painel/pets/${pet.id}`}
          className="flex items-center gap-3 rounded-sm font-display text-lg hover:text-brand"
        >
          <span className="size-11 shrink-0 overflow-hidden rounded-xl bg-shell">
            <PetPhoto pet={pet} className="size-11" iconClassName="size-5" />
          </span>
          {pet.name}
        </Link>
        <span className="rounded-pill bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep">
          {formatType(pet.type)}
        </span>
        <span className="rounded-pill bg-shell px-2.5 py-1 text-xs font-bold text-ink-soft">
          {formatAge(pet.age)}
        </span>
        <span className="rounded-pill bg-shell px-2.5 py-1 text-xs font-bold text-ink-soft">
          {formatSize(pet.size)}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-ink-soft">
          <MapPin className="size-4 text-brand" aria-hidden />
          {pet.city}
        </span>

        {pet.adopted ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void apply(false)}
            aria-label={`Reabrir o anúncio de ${pet.name}`}
            className="ml-auto rounded-pill px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand-soft disabled:opacity-60"
          >
            {saving ? 'Reabrindo…' : 'Reabrir anúncio'}
          </button>
        ) : !confirming ? (
          <button
            type="button"
            onClick={() => {
              setConfirming(true)
            }}
            aria-label={`Marcar ${pet.name} como adotado`}
            className="ml-auto rounded-pill px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand-soft"
          >
            Marcar como adotado
          </button>
        ) : null}
      </div>

      {confirming ? (
        <div className="mt-3 rounded-2xl bg-shell p-4 sm:flex sm:items-center sm:gap-4">
          <p className="text-sm font-semibold text-ink-soft sm:flex-1">
            {pet.name} sai da busca na hora. Você pode reabrir o anúncio depois,
            aqui mesmo.
          </p>
          <div className="mt-3 flex items-center gap-2 sm:mt-0 sm:shrink-0">
            <Button size="sm" onClick={() => void apply(true)} disabled={saving}>
              {saving ? (
                'Dando baixa…'
              ) : (
                <>
                  <Check className="size-4" aria-hidden />
                  Confirmar adoção
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => {
                setConfirming(false)
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm font-bold text-brand-deep">
          {error}
        </p>
      ) : null}
    </li>
  )
}

function PublishedPets({ org }: { org: ApiOrg }) {
  const navigate = useNavigate()
  const { data, loading, error, reload } = useRequest(
    useCallback(() => fetchOrgPets(org), [org]),
  )

  // O pet muda de seção assim que a API confirma, sem refazer a lista inteira.
  // Estas sobreposições valem só até a próxima carga, que já vem correta.
  const [changed, setChanged] = useState<Record<string, boolean>>({})
  const [notice, setNotice] = useState<string | null>(null)

  const onUnauthorized = useCallback(() => {
    navigate('/ong/entrar', { replace: true })
  }, [navigate])

  const onChanged = useCallback((pet: Pet, adopted: boolean) => {
    setChanged((current) => ({ ...current, [pet.id]: adopted }))
    setNotice(
      adopted
        ? `${pet.name} foi marcado como adotado e saiu da busca.`
        : `${pet.name} voltou para a busca.`,
    )
  }, [])

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

  const pets = (data ?? []).map((pet) => ({
    ...pet,
    adopted: changed[pet.id] ?? pet.adopted,
  }))
  const listed = pets.filter((pet) => !pet.adopted)
  const adopted = pets.filter((pet) => pet.adopted)

  const rows = (items: Pet[]) => (
    <ul className="mt-5">
      {items.map((pet) => (
        <PetRow
          key={pet.id}
          pet={pet}
          onChanged={onChanged}
          onUnauthorized={onUnauthorized}
        />
      ))}
    </ul>
  )

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {notice}
      </div>

      {notice ? (
        <Callout icon={<Check className="size-5" aria-hidden />}>{notice}</Callout>
      ) : null}

      {listed.length ? (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl">Aguardando adoção</h2>
            <p className="text-sm font-bold text-ink-soft">
              {listed.length} na busca
            </p>
          </div>
          {rows(listed)}
        </Card>
      ) : (
        <Card>
          <h2 className="text-2xl">
            {adopted.length
              ? 'Nenhum pet aguardando adoção'
              : 'Nenhum pet publicado ainda'}
          </h2>
          <p className="mt-3 max-w-md font-semibold text-ink-soft">
            {adopted.length
              ? 'Todos os seus anúncios foram adotados. Publique outro quando houver um novo resgate.'
              : `Assim que você cadastrar o primeiro, ele aparece na busca de quem procura adotar em ${org.city}.`}
          </p>
          <Link to="/ong/painel/novo-pet" className={`${buttonClass()} mt-6`}>
            <Plus className="size-5" aria-hidden />
            Cadastrar pet
          </Link>
        </Card>
      )}

      {adopted.length ? (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl">Já adotados</h2>
            <p className="text-sm font-bold text-ink-soft">
              {adopted.length} fora da busca
            </p>
          </div>
          {rows(adopted)}
          <p className="mt-5 text-sm font-semibold text-ink-soft">
            Estes anúncios não aparecem para quem procura adotar. Reabra se o pet
            voltar a precisar de um lar.
          </p>
        </Card>
      ) : null}
    </>
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
