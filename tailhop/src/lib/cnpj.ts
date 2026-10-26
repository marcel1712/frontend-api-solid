/** Só os dígitos: aceita `12.345.678/0001-95` e `12345678000195`. */
export function cnpjDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 14)
}

/** Pontua conforme a pessoa digita: `12345678` vira `12.345.678`. */
export function formatCnpj(value: string): string {
  const d = cnpjDigits(value)
  return [
    d.slice(0, 2),
    d.length > 2 ? `.${d.slice(2, 5)}` : '',
    d.length > 5 ? `.${d.slice(5, 8)}` : '',
    d.length > 8 ? `/${d.slice(8, 12)}` : '',
    d.length > 12 ? `-${d.slice(12, 14)}` : '',
  ].join('')
}

function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((total, weight, i) => total + Number(digits[i]) * weight, 0)
  const rest = sum % 11
  return rest < 2 ? 0 : 11 - rest
}

/**
 * Mesma conta que a API faz. Pega o erro de digitação aqui, antes de gastar o
 * envio — a API ainda consulta a Receita, que é quem diz se o CNPJ existe.
 */
export function isValidCnpj(value: string): boolean {
  const d = cnpjDigits(value)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false

  return (
    Number(d[12]) === checkDigit(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) &&
    Number(d[13]) === checkDigit(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  )
}
