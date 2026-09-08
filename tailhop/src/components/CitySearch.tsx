import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buttonClass } from './button-styles'

interface CitySearchProps {
  /**
   * `hero` é o cartão flutuante da home, `bar` a versão do header e `panel` a
   * do estado vazio da listagem, onde o campo é a própria chamada para agir.
   */
  variant?: 'hero' | 'bar' | 'panel'
  initialCity?: string
  autoFocus?: boolean
}

export function CitySearch({
  variant = 'hero',
  initialCity = '',
  autoFocus = false,
}: CitySearchProps) {
  const [city, setCity] = useState(initialCity)
  const navigate = useNavigate()

  const bar = variant === 'bar'

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        const value = city.trim()
        if (value) navigate(`/pets?cidade=${encodeURIComponent(value)}`)
      }}
      className={
        variant === 'hero'
          ? 'flex flex-col gap-3 rounded-[2rem] bg-surface p-4 shadow-card sm:flex-row sm:items-center'
          : variant === 'panel'
            ? 'mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center'
            : 'flex flex-1 items-center gap-2'
      }
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-pill border border-hairline bg-canvas px-4 focus-within:border-brand">
        <Search className="size-5 shrink-0 text-brand" aria-hidden />
        <span className="sr-only">Cidade</span>
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite sua cidade"
          autoComplete="address-level2"
          autoFocus={autoFocus}
          className={`min-w-0 flex-1 bg-transparent font-semibold outline-hidden placeholder:text-ink-soft ${
            bar ? 'h-10 text-sm' : 'h-12 text-base'
          }`}
        />
      </label>
      <button
        type="submit"
        className={buttonClass({ size: bar ? 'sm' : 'lg' })}
      >
        Buscar
      </button>
    </form>
  )
}
