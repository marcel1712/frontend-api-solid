/**
 * Estilos do botão, fora do arquivo de componentes para que `<button>` e os
 * `<Link>` com cara de botão compartilhem uma definição só — e para o Fast
 * Refresh não perder o estado por causa de um export que não é componente.
 */
type Variant = 'primary' | 'outline' | 'ghost' | 'accent' | 'on-brand'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-deep',
  accent: 'bg-teal text-ink shadow-lift hover:bg-teal-deep',
  outline: 'border-2 border-brand text-brand hover:bg-brand-soft',
  ghost: 'text-brand hover:bg-brand-soft',
  'on-brand': 'border-2 border-white/70 text-white hover:bg-white/15',
}

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export interface ButtonStyle {
  variant?: Variant
  size?: Size
  full?: boolean
}

export function buttonClass({
  variant = 'primary',
  size = 'md',
  full = false,
}: ButtonStyle = {}) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-pill font-display font-semibold',
    'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
    VARIANT[variant],
    SIZE[size],
    full ? 'w-full' : '',
  ].join(' ')
}
