import { PawPrint } from 'lucide-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PetCard, PetCardSkeleton } from '@/components/PetCard'
import { Footer, Header } from '@/components/SiteChrome'
import { searchPets } from '@/lib/api'
import type { AgeGroup, AnimalSize, AnimalType } from '@/lib/types'
import { useRequest } from '@/lib/useRequest'

const AGE_OPTIONS: { value: AgeGroup | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'puppy', label: 'Filhote' },
  { value: 'adult', label: 'Adulto' },
  { value: 'senior', label: 'Idoso' },
]

const SIZE_OPTIONS: { value: AnimalSize | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'Small', label: 'Pequeno' },
  { value: 'Medium', label: 'Médio' },
  { value: 'Large', label: 'Grande' },
]

const TYPE_OPTIONS: { value: AnimalType | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'Dog', label: 'Cachorro' },
  { value: 'Cat', label: 'Gato' },
]

interface FilterGroupProps<T extends string> {
  label: string
  value: T | ''
  options: { value: T | ''; label: string }[]
  onChange: (value: T | '') => void
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: FilterGroupProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-bold tracking-wide text-ink-soft">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value || 'all'}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                selected
                  ? 'bg-brand text-white'
                  : 'bg-shell text-ink-soft hover:bg-brand-soft hover:text-brand-deep'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface p-10 text-center shadow-card">{children}</div>
  )
}

export function Pets() {
  const [params, setParams] = useSearchParams()

  const city = params.get('cidade')?.trim() ?? ''
  const age = (params.get('idade') ?? '') as AgeGroup | ''
  const size = (params.get('porte') ?? '') as AnimalSize | ''
  const type = (params.get('animal') ?? '') as AnimalType | ''

  const setFilter = (key: string) => (value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const { data, loading, error, reload } = useRequest(
    useCallback(
      () =>
        searchPets({
          city,
          age: age || undefined,
          size: size || undefined,
          type: type || undefined,
        }),
      [city, age, size, type],
    ),
    { enabled: city !== '' },
  )

  const hasFilters = Boolean(age || size || type)

  return (
    <>
      <Header withSearch initialCity={city} />

      <main className="mx-auto max-w-6xl px-5 pt-36 pb-16 sm:px-8 md:pt-24">
        <h1 className="text-3xl sm:text-4xl">
          {city ? `Pets para adoção em ${city}` : 'Pets para adoção'}
        </h1>
        <p className="mt-2 font-semibold text-ink-soft">
          {city
            ? 'Fale direto com a ONG responsável pelo pet que te interessar.'
            : 'Informe uma cidade para ver os pets disponíveis perto de você.'}
        </p>

        <div className="mt-8 flex flex-col gap-6 rounded-3xl bg-surface p-6 shadow-card sm:flex-row sm:flex-wrap sm:gap-x-10">
          <FilterGroup
            label="Idade"
            value={age}
            options={AGE_OPTIONS}
            onChange={setFilter('idade')}
          />
          <FilterGroup
            label="Porte"
            value={size}
            options={SIZE_OPTIONS}
            onChange={setFilter('porte')}
          />
          <FilterGroup
            label="Animal"
            value={type}
            options={TYPE_OPTIONS}
            onChange={setFilter('animal')}
          />
        </div>

        <div className="mt-8" aria-live="polite" aria-busy={loading}>
          {!city ? (
            <Panel>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
                <PawPrint className="size-7" aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl">Comece pela sua cidade</h2>
              <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
                A cidade é o único filtro obrigatório. Digite o nome dela na busca acima
                para encontrar pets por perto.
              </p>
            </Panel>
          ) : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <PetCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <Panel>
              <h2 className="text-2xl">A busca não completou</h2>
              <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">{error}</p>
              <button
                type="button"
                onClick={reload}
                className="mt-6 rounded-pill bg-brand px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                Buscar de novo
              </button>
            </Panel>
          ) : data?.length ? (
            <>
              <p className="sr-only">
                {data.length} {data.length === 1 ? 'pet encontrado' : 'pets encontrados'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {data.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            </>
          ) : (
            <Panel>
              <h2 className="text-2xl">Nenhum pet em {city} por enquanto</h2>
              <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
                {hasFilters
                  ? 'Nenhum pet dessa cidade combina com os filtros escolhidos. Tente afrouxar um deles.'
                  : 'Nenhuma ONG cadastrou pets nessa cidade ainda. Tente uma cidade vizinha ou volte em breve.'}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setParams(new URLSearchParams({ cidade: city }), { replace: true })
                  }}
                  className="mt-6 rounded-pill bg-brand px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-brand-deep"
                >
                  Limpar filtros
                </button>
              ) : null}
            </Panel>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
