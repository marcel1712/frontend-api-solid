import { AGE_RANGE } from './format'
import { mockFeaturedPets, mockSearchPets } from './mock'
import type {
  ApiPetWithWhatsapp,
  OrgSignupPayload,
  Pet,
  PetSearchParams,
} from './types'

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

/** Sem backend configurado o site roda com os dados fictícios. */
export const usingMockData = BASE_URL === ''

/** Erro de rede/HTTP com uma mensagem que pode ser mostrada na tela. */
export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      // Só quem tem corpo declara o tipo. Mandar `Content-Type` num GET faria
      // o navegador disparar um preflight CORS à toa em toda busca.
      headers: init?.body
        ? { 'Content-Type': 'application/json', ...init.headers }
        : init?.headers,
    })
  } catch {
    throw new ApiError('Não foi possível falar com o servidor. Verifique sua conexão.')
  }

  if (!response.ok) {
    throw new ApiError(
      response.status >= 500
        ? 'O servidor não respondeu como esperado. Tente de novo em instantes.'
        : 'Não foi possível concluir a busca.',
      response.status,
    )
  }

  return (await response.json()) as T
}

/**
 * A API entrega o pet com o whatsapp junto, mas sem cidade — ela vem da busca,
 * já que todo pet da resposta pertence a uma org daquela cidade. Uma org sem
 * número vem como `''`, e aí o card cai para o estado sem contato.
 */
function toPet(pet: ApiPetWithWhatsapp, city: string): Pet {
  return { ...pet, city, whatsapp: pet.whatsapp || null, photoUrl: null }
}

/**
 * Busca pets disponíveis numa cidade.
 *
 * Todos os filtros rodam no banco: `size` e `type` direto, e a faixa etária
 * traduzida para `ageMin`/`ageMax`. Adotados já saem de fora na consulta, então
 * o cliente não refiltra nada — o que chega é o que aparece.
 */
export async function searchPets(params: PetSearchParams): Promise<Pet[]> {
  const city = params.city.trim()
  if (!city) return []

  if (usingMockData) return mockSearchPets({ ...params, city })

  const query = new URLSearchParams({ city, page: String(params.page ?? 1) })
  if (params.size) query.set('size', params.size)
  if (params.type) query.set('type', params.type)

  if (params.age) {
    const { min, max } = AGE_RANGE[params.age]
    if (min !== undefined) query.set('ageMin', String(min))
    if (max !== undefined) query.set('ageMax', String(max))
  }

  const pets = await request<ApiPetWithWhatsapp[]>(`/pets/search?${query.toString()}`)
  return pets.map((pet) => toPet(pet, city))
}

/**
 * Pets da vitrine da home. A API não tem endpoint de destaques nem busca sem
 * cidade, então a home mostra os mais recentes das cidades já atendidas.
 */
const SHOWCASE_CITIES = ['Salvador', 'Recife', 'Feira de Santana']

export async function fetchFeaturedPets(limit = 4): Promise<Pet[]> {
  if (usingMockData) return mockFeaturedPets(limit)

  const results = await Promise.all(
    SHOWCASE_CITIES.map((city) => searchPets({ city }).catch(() => [] as Pet[])),
  )

  return results
    .flat()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
}

/** `GET /pets/:id` — detalhes do pet com o whatsapp da org dona. */
export async function fetchPetDetails(id: string): Promise<ApiPetWithWhatsapp> {
  return request<ApiPetWithWhatsapp>(`/pets/${id}`)
}

/**
 * `POST /orgs`. O formulário da tela de cadastro é demonstrativo, então nada
 * chama esta função por enquanto — ela existe para a integração ser só trocar
 * a chamada no `OrgSignup`, sem espalhar fetch pelos componentes.
 */
export async function registerOrg(payload: OrgSignupPayload): Promise<void> {
  await request('/orgs', { method: 'POST', body: JSON.stringify(payload) })
}
