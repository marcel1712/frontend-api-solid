import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import type { InputHTMLAttributes } from 'react'
import { buttonClass, type ButtonStyle } from './button-styles'

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    ButtonStyle {}

export function Button({ variant, size, full, ...props }: ButtonProps) {
  return <button {...props} className={buttonClass({ variant, size, full })} />
}

/* ── Campos de formulário ─────────────────────────────────────────────────── */

const CONTROL =
  'w-full rounded-2xl border border-hairline bg-canvas px-4 font-semibold outline-hidden focus:border-brand disabled:opacity-60'

interface FieldShellProps {
  label: string
  /** Texto de apoio ou de erro exibido abaixo do campo. */
  hint?: string
  error?: string
  children: ReactNode
}

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {error ? (
        <span className="text-sm font-bold text-brand-deep">{error}</span>
      ) : hint ? (
        <span className="text-sm font-semibold text-ink-soft">{hint}</span>
      ) : null}
    </label>
  )
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> &
  Omit<FieldShellProps, 'children'>

export function Field({ label, hint, error, ...input }: FieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <input
        {...input}
        aria-invalid={error ? true : undefined}
        className={`h-12 ${CONTROL} ${error ? 'border-brand' : ''}`}
      />
    </FieldShell>
  )
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> &
  Omit<FieldShellProps, 'children'>

export function TextAreaField({ label, hint, error, ...area }: TextAreaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <textarea
        {...area}
        aria-invalid={error ? true : undefined}
        className={`py-3 leading-relaxed ${CONTROL} ${error ? 'border-brand' : ''}`}
      />
    </FieldShell>
  )
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> &
  Omit<FieldShellProps, 'children'>

export function SelectField({ label, hint, error, children, ...select }: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <select {...select} className={`h-12 ${CONTROL}`}>
        {children}
      </select>
    </FieldShell>
  )
}

/* ── Avisos ───────────────────────────────────────────────────────────────── */

interface CalloutProps {
  tone?: 'info' | 'error'
  icon?: ReactNode
  children: ReactNode
}

export function Callout({ tone = 'info', icon, children }: CalloutProps) {
  return (
    <p
      role={tone === 'error' ? 'alert' : undefined}
      className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-bold ${
        tone === 'error'
          ? 'bg-brand-soft text-brand-deep'
          : 'bg-shell text-ink-soft'
      }`}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </p>
  )
}
