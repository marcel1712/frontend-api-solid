import { matchesAgeGroup } from './format'
import type { Pet, PetSearchParams } from './types'

/**
 * Dados fictícios usados quando `VITE_API_URL` não está definida, para o site
 * funcionar em deploy antes do backend estar hospedado. O formato é o mesmo
 * que o cliente real monta, então trocar é só definir a variável de ambiente.
 */
const PETS: Pet[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Bidu',
    orgId: 'org-patas',
    age: 2,
    size: 'Small',
    type: 'Dog',
    bio: 'Brincalhão, adora colo e já é castrado. Se dá bem com crianças e com outros cachorros.',
    adopted: false,
    created_at: '2026-08-02T12:00:00.000Z',
    city: 'Salvador',
    whatsapp: '5571999990001',
    photoUrl: null,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Mel',
    orgId: 'org-miau',
    age: 0,
    size: 'Small',
    type: 'Cat',
    bio: 'Curiosa e muito dócil. Já usa a caixinha de areia sem nenhum problema.',
    adopted: false,
    created_at: '2026-08-11T12:00:00.000Z',
    city: 'Salvador',
    whatsapp: '5571999990002',
    photoUrl: null,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Thor',
    orgId: 'org-fiel',
    age: 5,
    size: 'Large',
    type: 'Dog',
    bio: 'Calmo, obediente e companheiro. Ideal para quem tem espaço no quintal.',
    adopted: false,
    created_at: '2026-08-19T12:00:00.000Z',
    city: 'Feira de Santana',
    whatsapp: '5575999990003',
    photoUrl: null,
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Nina',
    orgId: 'org-miau',
    age: 3,
    size: 'Medium',
    type: 'Cat',
    bio: 'Tranquila e independente. Prefere casas sem muita agitação.',
    adopted: false,
    created_at: '2026-08-24T12:00:00.000Z',
    city: 'Recife',
    whatsapp: '5581999990004',
    photoUrl: null,
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Pipoca',
    orgId: 'org-patas',
    age: 1,
    size: 'Medium',
    type: 'Dog',
    bio: 'Elétrica do jeito certo: puxa a coleira até o parque e dorme a noite inteira.',
    adopted: false,
    created_at: '2026-08-28T12:00:00.000Z',
    city: 'Salvador',
    whatsapp: '5571999990001',
    photoUrl: null,
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    name: 'Zeca',
    orgId: 'org-miau',
    age: 9,
    size: 'Small',
    type: 'Cat',
    bio: 'Castrado e vacinado. Passa o dia na janela vendo o movimento da rua.',
    adopted: false,
    created_at: '2026-09-01T12:00:00.000Z',
    city: 'Salvador',
    whatsapp: '5571999990002',
    photoUrl: null,
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    name: 'Luna',
    orgId: 'org-fiel',
    age: 1,
    size: 'Large',
    type: 'Dog',
    bio: 'Chegou magrinha e hoje é pura energia. Aprende comando novo em dois dias.',
    adopted: false,
    created_at: '2026-09-03T12:00:00.000Z',
    city: 'Recife',
    whatsapp: '5581999990005',
    photoUrl: null,
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    name: 'Amora',
    orgId: 'org-patas',
    age: 3,
    size: 'Small',
    type: 'Cat',
    bio: 'Resgatada de uma obra. Desconfiada no começo, grudenta depois da primeira semana.',
    adopted: false,
    created_at: '2026-09-05T12:00:00.000Z',
    city: 'Feira de Santana',
    whatsapp: '5575999990006',
    photoUrl: null,
  },
]

export const normalizeCity = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

/** Aplica os mesmos recortes que a API faz na consulta, inclusive o de adotados. */
export async function mockSearchPets(params: PetSearchParams): Promise<Pet[]> {
  await delay(550)
  const target = normalizeCity(params.city)

  return PETS.filter((pet) => {
    if (!normalizeCity(pet.city).includes(target)) return false
    if (pet.adopted) return false
    if (params.size && pet.size !== params.size) return false
    if (params.type && pet.type !== params.type) return false
    if (params.age && !matchesAgeGroup(pet.age, params.age)) return false
    return true
  })
}

export async function mockFeaturedPets(limit: number): Promise<Pet[]> {
  await delay(450)
  return PETS.slice(0, limit)
}
