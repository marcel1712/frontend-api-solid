import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface CitySearchProps {
  /** `hero` é o cartão flutuante da home; `bar` é a versão do header. */
  variant?: 'hero' | 'bar'
  initialCity?: string
}

export function CitySearch({ variant = 'hero', initialCity = '' }: CitySearchProps) {
  const [city, setCity] = useState(initialCity)
  const navigate = useNavigate()
  const hero = variant === 'hero'

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        const value = city.trim()
        if (value) navigate(`/pets?cidade=${encodeURIComponent(value)}`)
      }}
      className={
        hero
          ? 'flex flex-col gap-3 rounded-[2rem] bg-surface p-4 shadow-card sm:flex-row sm:items-center'
          : 'flex flex-1 items-center gap-2'
      }
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-pill border border-hairline bg-canvas px-4">
        <Search className="size-5 shrink-0 text-brand" aria-hidden />
        <span className="sr-only">Cidade</span>
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite sua cidade"
          autoComplete="address-level2"
          className={`min-w-0 flex-1 bg-transparent font-semibold outline-hidden placeholder:text-ink-soft ${
            hero ? 'h-12 text-base' : 'h-10 text-sm'
          }`}
        />
      </label>
      <button
        type="submit"
        className={`shrink-0 rounded-pill bg-brand font-display font-semibold text-white transition-colors hover:bg-brand-deep ${
          hero ? 'px-8 py-3.5 text-lg' : 'px-5 py-2.5 text-sm'
        }`}
      >
        Buscar
      </button>
    </form>
  )
}
