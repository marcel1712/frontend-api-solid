/**
 * Regras de senha do cadastro de ONG.
 *
 * Vale registrar o que isto é e o que não é: validação no cliente é orientação,
 * não segurança. Qualquer um fala com `POST /orgs` direto e passa por cima
 * daqui — hoje a API só exige de 6 a 100 caracteres. Para virar regra de
 * verdade, o mesmo critério precisa existir no backend; aqui ele serve para a
 * pessoa escolher uma senha melhor antes de errar.
 */

export const MIN_PASSWORD_LENGTH = 10

/** A API recusa acima disso, então avisamos antes de a pessoa perder o texto. */
export const MAX_PASSWORD_LENGTH = 100

export interface PasswordRule {
  id: string
  label: string
  test: (password: string, context: PasswordContext) => boolean
}

export interface PasswordContext {
  /** E-mail digitado no formulário, para barrar senha derivada dele. */
  email?: string
}

/**
 * Senhas que passam por qualquer regra de composição e ainda assim são as
 * primeiras que um atacante tenta. Lista curta de propósito: o valor está em
 * pegar o caso óbvio, não em fingir que substitui uma checagem de vazamentos.
 */
const COMMON = [
  'senha',
  'password',
  '123456',
  'qwerty',
  'admin',
  'tailhop',
  'abcdef',
  'iloveyou',
  'adotar',
]

const stripAccents = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Detecta `aaa`, `123`, `abc` e afins, em ordem crescente ou decrescente. */
function hasRunOfThree(password: string): boolean {
  for (let i = 0; i + 2 < password.length; i++) {
    const [a, b, c] = [
      password.charCodeAt(i),
      password.charCodeAt(i + 1),
      password.charCodeAt(i + 2),
    ]
    if (a === b && b === c) return true
    if (b - a === 1 && c - b === 1) return true
    if (a - b === 1 && b - c === 1) return true
  }
  return false
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
    test: (password) =>
      password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH,
  },
  {
    id: 'case',
    label: 'Uma letra maiúscula e uma minúscula',
    test: (password) => /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password),
  },
  {
    id: 'number',
    label: 'Um número',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'symbol',
    label: 'Um símbolo, como ! ? @ ou #',
    test: (password) => /[^\p{L}\p{N}]/u.test(password),
  },
  {
    id: 'predictable',
    label: 'Nada de sequência óbvia, palavra comum ou seu e-mail',
    test: (password, { email }) => {
      if (!password) return false

      const plain = stripAccents(password)
      if (COMMON.some((word) => plain.includes(word))) return false
      if (hasRunOfThree(plain)) return false

      // "contato@patas.org" viraria "contato" e "patas": nome de usuário e
      // domínio são as primeiras coisas que alguém tenta.
      const parts = (email ?? '')
        .split(/[@.]/)
        .map(stripAccents)
        .filter((part) => part.length >= 4)
      return !parts.some((part) => plain.includes(part))
    },
  },
]

export interface PasswordStrength {
  /** Ids das regras já satisfeitas. */
  met: string[]
  /** Quantas regras passaram, de 0 ao total. */
  score: number
  total: number
  valid: boolean
  label: 'fraca' | 'razoável' | 'forte'
}

export function scorePassword(
  password: string,
  context: PasswordContext = {},
): PasswordStrength {
  const met = PASSWORD_RULES.filter((rule) => rule.test(password, context)).map(
    (rule) => rule.id,
  )
  const total = PASSWORD_RULES.length

  return {
    met,
    score: met.length,
    total,
    valid: met.length === total,
    label: met.length === total ? 'forte' : met.length >= total - 2 ? 'razoável' : 'fraca',
  }
}
