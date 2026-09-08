import type { AgeGroup, AnimalSize, AnimalType, Pet } from './types'

/**
 * O backend guarda `age` como um Int sem unidade declarada. Aqui ele é lido
 * como anos — se o backend passar a gravar meses, este é o único ponto a mudar.
 */
export function formatAge(age: number): string {
  if (age < 1) return 'Filhote'
  return age === 1 ? '1 ano' : `${age} anos`
}

const SIZE_LABEL: Record<AnimalSize, string> = {
  Small: 'Porte pequeno',
  Medium: 'Porte médio',
  Large: 'Porte grande',
}

export const formatSize = (size: AnimalSize) => SIZE_LABEL[size]

const TYPE_LABEL: Record<AnimalType, string> = {
  Dog: 'Cachorro',
  Cat: 'Gato',
  Bird: 'Pássaro',
  Fish: 'Peixe',
  Turtle: 'Tartaruga',
  Rabbit: 'Coelho',
  Hamster: 'Hamster',
  Ferret: 'Furão',
  Chinchilla: 'Chinchila',
}

export const formatType = (type: AnimalType) => TYPE_LABEL[type]

/**
 * Faixas etárias da interface, em anos. Esta tabela é a única definição: a
 * chamada real vira `ageMin`/`ageMax` e o mock usa `matchesAgeGroup`.
 */
export const AGE_RANGE: Record<AgeGroup, { min?: number; max?: number }> = {
  puppy: { max: 0 },
  adult: { min: 1, max: 7 },
  senior: { min: 8 },
}

export function matchesAgeGroup(age: number, group: AgeGroup): boolean {
  const { min, max } = AGE_RANGE[group]
  return (min === undefined || age >= min) && (max === undefined || age <= max)
}

/**
 * Link de conversa com a ONG já com a mensagem escrita — a pessoa só aperta
 * enviar. O contato acontece fora da plataforma, então este link é o handoff.
 */
export function whatsappLink(pet: Pet): string | null {
  if (!pet.whatsapp) return null
  const number = pet.whatsapp.replace(/\D/g, '')
  const message = `Olá! Vi o perfil do ${pet.name} no Tailhop e queria saber como funciona a adoção.`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
