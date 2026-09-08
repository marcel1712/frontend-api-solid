import { AGE_RANGE } from './format'
import {
  mockAuthenticate,
  mockCreatePet,
  mockFeaturedPets,
  mockOrg,
  mockDeletePhoto,
  mockOrgPets,
  mockPetPage,
  mockSearchPets,
  mockSetAdopted,
  mockUploadPhoto,
} from './mock'
import type {
  ApiOrg,
  ApiOwnPet,
  ApiPet,
  ApiPetImage,
  ApiPetWithWhatsapp,
  CreatePetPayload,
  CredentialsPayload,
  OrgSignupPayload,
  Pet,
  PetPage,
  PetSearchParams,
  UploadTicket,
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

  /** Sessão ausente ou expirada: quem chamou deve mandar a ONG para o login. */
  get isUnauthorized() {
    return this.status === 401
  }
}

/**
 * Token da sessão da ONG. Fica aqui, e não num parâmetro de cada chamada, para
 * que nenhum componente precise carregá-lo por aí. Quem o mantém é o
 * `AuthProvider`, a única fonte da sessão.
 */
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

interface RequestOptions extends RequestInit {
  /** Anexa o `Authorization` da sessão; a chamada falha com 401 sem ela. */
  authenticated?: boolean
}

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const headers = new Headers(init?.headers)

  // Só quem tem corpo declara o tipo. Mandar `Content-Type` num GET faria o
  // navegador disparar um preflight CORS à toa em toda busca.
  if (init?.body) headers.set('Content-Type', 'application/json')
  if (init?.authenticated && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError('Não foi possível falar com o servidor. Verifique sua conexão.')
  }

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status), response.status)
  }

  return (await response.json()) as T
}

function messageForStatus(status: number): string {
  if (status === 401) return 'Sua sessão expirou. Entre de novo para continuar.'
  if (status === 403) return 'Esta conta não tem permissão para essa ação.'
  if (status === 409) return 'Limite atingido, ou o registro já existe.'
  if (status >= 500) {
    return 'O servidor não respondeu como esperado. Tente de novo em instantes.'
  }
  return 'Não foi possível concluir a solicitação.'
}

/**
 * A API entrega o pet com o whatsapp junto, mas sem cidade — ela vem da busca,
 * já que todo pet da resposta pertence a uma org daquela cidade. Uma org sem
 * número vem como `''`, e aí o card cai para o estado sem contato.
 */
function toPet(pet: ApiPetWithWhatsapp, city: string): Pet {
  return {
    ...pet,
    city,
    whatsapp: pet.whatsapp || null,
    photos: pet.images,
  }
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

/**
 * Um pet e a ONG que o publicou, para a página de detalhes.
 *
 * `GET /pets/:id` entrega o whatsapp e as fotos, mas não o nome nem a cidade da
 * ONG — esses saem de `GET /orgs/:id`. São duas requisições, aceitáveis numa
 * página de detalhe; se a ONG falhar, a página ainda abre com o pet, porque a
 * decisão de adotar não depende do endereço do abrigo.
 */
export async function fetchPetPage(id: string): Promise<PetPage> {
  if (usingMockData) return mockPetPage(id)

  const pet = await request<ApiPetWithWhatsapp>(`/pets/${id}`)
  const org = await fetchOrg(pet.orgId).catch(() => null)

  return {
    pet: toPet(pet, org?.city ?? ''),
    org,
  }
}

/**
 * `POST /orgs`. O formulário da tela de cadastro é demonstrativo, então nada
 * chama esta função por enquanto — ela existe para a integração ser só trocar
 * a chamada no `OrgSignup`, sem espalhar fetch pelos componentes.
 */
export async function registerOrg(payload: OrgSignupPayload): Promise<void> {
  await request('/orgs', { method: 'POST', body: JSON.stringify(payload) })
}

/* ── Área da ONG ──────────────────────────────────────────────────────────── */

/** `POST /orgs/sessions` — devolve só o token; o perfil vem depois. */
export async function authenticateOrg(
  credentials: CredentialsPayload,
): Promise<string> {
  if (usingMockData) return mockAuthenticate(credentials)

  const { token } = await request<{ token: string }>('/orgs/sessions', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  return token
}

/** `GET /orgs/:id` — perfil público da ONG, já sem o `password_hash`. */
export async function fetchOrg(id: string): Promise<ApiOrg> {
  if (usingMockData) return mockOrg(id)
  return request<ApiOrg>(`/orgs/${id}`)
}

/** `POST /pets` — publica um pet na ONG autenticada. */
export async function createPet(payload: CreatePetPayload): Promise<ApiPet> {
  if (usingMockData) return mockCreatePet(payload)

  return request<ApiPet>('/pets', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(payload),
  })
}

/**
 * `PATCH /pets/:id/adopt` — dá baixa no anúncio ou o reabre.
 *
 * Reabrir só é possível porque `GET /orgs/me/pets` devolve os adotados: sem
 * essa lista não haveria tela de onde chamar. Só a ONG dona passa daqui — o
 * backend responde 403 para as outras.
 */
export async function setPetAdopted(petId: string, adopted: boolean): Promise<void> {
  if (usingMockData) return mockSetAdopted(petId, adopted)

  await request<{ adoptedPet: ApiPet }>(`/pets/${petId}/adopt`, {
    method: 'PATCH',
    authenticated: true,
    body: JSON.stringify({ adopted }),
  })
}

/* ── Fotos do pet ─────────────────────────────────────────────────────────── */

/**
 * Sobe o arquivo direto no R2, sem passar pela API.
 *
 * XHR em vez de `fetch` porque só ele reporta progresso de upload, e uma foto
 * de celular em rede ruim sem barra de progresso parece travada.
 *
 * O `Content-Type` precisa ser idêntico ao que assinou a URL — o R2 responde
 * 403 se divergir. Como ambos saem de `file.type`, batem por construção.
 */
function putSignedFile(
  uploadUrl: string,
  file: File,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new ApiError('O envio da foto foi recusado pelo servidor de arquivos.', xhr.status))
    }
    xhr.onerror = () =>
      reject(new ApiError('Não foi possível enviar a foto. Verifique sua conexão.'))
    xhr.onabort = () => reject(new ApiError('Envio cancelado.'))

    xhr.send(file)
  })
}

/**
 * Publica uma foto: pede a URL assinada, sobe o arquivo e confirma.
 *
 * A URL é pedida aqui, na hora do envio, e não quando o arquivo é escolhido:
 * ela expira em cinco minutos, e alguém que escolhe a foto e só depois se
 * decide perderia a janela. Nada é gravado no banco até o `confirm`, então um
 * envio interrompido não deixa registro apontando para arquivo inexistente.
 */
export async function uploadPetPhoto(
  petId: string,
  file: File,
  onProgress: (ratio: number) => void = () => {},
): Promise<ApiPetImage> {
  if (usingMockData) return mockUploadPhoto(petId, file, onProgress)

  const ticket = await request<UploadTicket>(`/pets/${petId}/images`, {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify({ contentType: file.type }),
  })

  await putSignedFile(ticket.uploadUrl, file, onProgress)

  // Só aqui o registro nasce: o backend confere no R2 que o objeto existe
  // mesmo antes de gravar. Um 404 nesta etapa quer dizer que o arquivo não
  // chegou ao bucket, e não que o pet sumiu — daí a mensagem própria.
  try {
    return await request<ApiPetImage>(`/pets/${petId}/images/confirm`, {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify({ key: ticket.key }),
    })
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 404) {
      throw new ApiError('A foto não chegou ao servidor de arquivos. Tente enviar de novo.', 404)
    }
    throw cause
  }
}

/** `DELETE /pets/:id/images/:imageId` — remove a foto do pet e do R2. */
export async function deletePetPhoto(petId: string, imageId: string): Promise<void> {
  if (usingMockData) return mockDeletePhoto(petId, imageId)

  await request(`/pets/${petId}/images/${imageId}`, {
    method: 'DELETE',
    authenticated: true,
  })
}

/**
 * `GET /orgs/me/pets` — os pets da própria ONG, adotados inclusive, 20 por
 * página. A org vem do JWT: nada que o cliente mande define de quem é a lista.
 */
export async function fetchOrgPets(org: ApiOrg, page = 1): Promise<Pet[]> {
  if (usingMockData) return mockOrgPets(org)

  const pets = await request<ApiOwnPet[]>(`/orgs/me/pets?page=${page}`, {
    authenticated: true,
  })

  // O endpoint não devolve cidade nem whatsapp: ambos são da própria ONG, que
  // já está em mãos aqui.
  return pets.map((pet) => ({
    ...pet,
    city: org.city,
    whatsapp: org.whatsapp || null,
    photos: pet.images,
  }))
}
