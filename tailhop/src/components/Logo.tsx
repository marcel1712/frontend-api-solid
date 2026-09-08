import logo from '@/assets/tailhop-logo.png'

/**
 * O símbolo é branco vazado, então em fundo claro ele só aparece dentro do
 * disco rosa; sobre a hero ele vai solto.
 */
interface LogoProps {
  variant?: 'on-brand' | 'on-light'
  size?: 'sm' | 'lg'
}

export function Logo({ variant = 'on-light', size = 'sm' }: LogoProps) {
  const large = size === 'lg'

  return (
    <span className="flex items-center gap-2.5">
      <span
        className={[
          'grid shrink-0 place-items-center overflow-hidden rounded-2xl',
          large ? 'size-11' : 'size-8',
          variant === 'on-light' ? 'bg-brand' : '',
        ].join(' ')}
      >
        <img src={logo} alt="" className="size-full object-contain p-0.5" />
      </span>
      <span
        className={[
          'font-display font-semibold tracking-tight',
          large ? 'text-2xl' : 'text-lg',
          variant === 'on-brand' ? 'text-white' : 'text-brand',
        ].join(' ')}
      >
        Tailhop
      </span>
    </span>
  )
}
