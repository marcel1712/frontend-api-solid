/**
 * Aparência dos controles de formulário, fora do arquivo de componentes para
 * que campos com estrutura própria (como o de senha, que tem botão dentro)
 * reusem a mesma casca sem duplicar classe — e para o Fast Refresh não perder
 * estado por causa de um export que não é componente.
 */
export const CONTROL =
  'w-full rounded-2xl border border-hairline bg-canvas px-4 font-semibold outline-hidden focus:border-brand disabled:opacity-60'
