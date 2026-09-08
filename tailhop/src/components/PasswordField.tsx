import { Check, Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import {
  MAX_PASSWORD_LENGTH,
  PASSWORD_RULES,
  scorePassword,
  type PasswordContext,
} from '@/lib/password'
import { CONTROL } from './field-styles'

/**
 * As barras carregam a cor; o texto fica neutro. Amarelo e laranja legíveis em
 * fundo claro não existem em tamanho de texto pequeno, e resolver isso com
 * cinza no rótulo é mais honesto do que escurecer a cor até ela deixar de
 * significar "atenção".
 */
const BAR_TONE: Record<string, string> = {
  fraca: 'bg-brand',
  razoável: 'bg-[#e8890c]',
  forte: 'bg-teal-deep',
}

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  context?: PasswordContext
  name?: string
  autoComplete?: string
  /** Erro do envio, mostrado abaixo da lista de requisitos. */
  error?: string
}

export function PasswordField({
  label,
  value,
  onChange,
  context = {},
  name = 'password',
  autoComplete = 'new-password',
  error,
}: PasswordFieldProps) {
  const inputId = useId()
  const listId = useId()
  const [visible, setVisible] = useState(false)
  const [touched, setTouched] = useState(false)

  const strength = scorePassword(value, context)

  // A lista só aparece depois que a pessoa começa a digitar: abrir o formulário
  // com cinco exigências pendentes lê como reprovação antes da tentativa.
  const showRules = touched || value.length > 0

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-bold">
        {label}
      </label>

      <div
        className={`flex items-center gap-2 ${CONTROL} ${
          error ? 'border-brand' : ''
        } focus-within:border-brand`}
      >
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          required
          maxLength={MAX_PASSWORD_LENGTH}
          autoComplete={autoComplete}
          aria-describedby={showRules ? listId : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => setTouched(true)}
          className="h-12 min-w-0 flex-1 bg-transparent outline-hidden"
        />
        {/* Revelar é o que permite digitar uma senha longa sem errar; sem isso
            as exigências acima viram um convite a escolher a mais curta que passa. */}
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="-mr-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-shell hover:text-ink"
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden />
          ) : (
            <Eye className="size-5" aria-hidden />
          )}
        </button>
      </div>

      {showRules ? (
        <div id={listId} className="mt-1">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {PASSWORD_RULES.map((rule, index) => (
                <span
                  key={rule.id}
                  className={`h-1.5 flex-1 rounded-pill transition-colors ${
                    index < strength.score ? BAR_TONE[strength.label] : 'bg-shell'
                  }`}
                />
              ))}
            </div>
            <span className="shrink-0 text-sm font-bold text-ink-soft">
              Senha {strength.label}
            </span>
          </div>

          <ul className="mt-3 flex flex-col gap-1.5">
            {PASSWORD_RULES.map((rule) => {
              const done = strength.met.includes(rule.id)
              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    done ? 'text-ink' : 'text-ink-soft'
                  }`}
                >
                  <span
                    className={`grid size-4.5 shrink-0 place-items-center rounded-full transition-colors ${
                      done ? 'bg-teal-deep text-white' : 'border border-hairline bg-canvas'
                    }`}
                  >
                    {done ? <Check className="size-3" strokeWidth={3} aria-hidden /> : null}
                  </span>
                  {rule.label}
                  <span className="sr-only">{done ? ' — atendido' : ' — pendente'}</span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-bold text-brand-deep">
          {error}
        </p>
      ) : null}
    </div>
  )
}
