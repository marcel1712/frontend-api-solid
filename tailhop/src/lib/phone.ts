/**
 * A API valida o WhatsApp como E.164 — código do país com `+`, sem espaços
 * nem pontuação. Ninguém digita assim: no Brasil se escreve `11989731163` ou
 * `(11) 98973-1163`. Exigir o formato da máquina seria transferir para a ONG
 * um trabalho que o código faz melhor, então aceitamos o que ela escreve e
 * convertemos antes de enviar.
 */

/** Só dígitos, opcionalmente com `+`, entre 8 e 15 dígitos. */
const E164 = /^\+[1-9]\d{7,14}$/

const BRAZIL = '+55'

/**
 * Converte o que foi digitado para E.164, ou devolve `null` se não der.
 *
 * Assume Brasil quando não há código de país, porque a plataforma é brasileira
 * e todas as cidades atendidas são daqui. Um número que já venha com `+` é
 * respeitado como está.
 */
export function toE164(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null

  // Já veio internacional: só tiramos a pontuação.
  if (hasPlus) {
    const candidate = `+${digits}`
    return E164.test(candidate) ? candidate : null
  }

  // Digitado com o 55 na frente, mas sem o `+`.
  if (digits.startsWith('55') && digits.length >= 12) {
    const candidate = `+${digits}`
    return E164.test(candidate) ? candidate : null
  }

  // Número nacional: 10 dígitos (fixo) ou 11 (celular com o 9).
  if (digits.length === 10 || digits.length === 11) {
    const candidate = `${BRAZIL}${digits}`
    return E164.test(candidate) ? candidate : null
  }

  return null
}
