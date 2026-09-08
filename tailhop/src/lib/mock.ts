import { ApiError } from './api'
import { matchesAgeGroup } from './format'
import type {
  ApiOrg,
  ApiPet,
  ApiPetImage,
  CreatePetPayload,
  Pet,
  PetPage,
  PetSearchParams,
} from './types'
import { MAX_PHOTOS_PER_PET } from './types'

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
    bio: 'Brincalhão, adora colo e já é castrado. Se dá bem com crianças e com outros cachorros — dividiu o canil com mais quatro sem nenhum problema. Chegou até nós com seis meses, muito magro, depois de ser encontrado sozinho perto da rodoviária. Hoje está com o peso certo, vacinado e vermifugado. Precisa de alguém com paciência para os primeiros dias: ele estranha barulho alto e demora a dormir em casa nova. Passeia bem na coleira e já entende sentar e ficar.',
    adopted: false,
    created_at: '2026-08-02T12:00:00.000Z',
    city: 'Salvador',
    whatsapp: '5571999990001',
    photos: [],
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Mel',
    orgId: 'org-miau',
    age: 0,
    size: 'Small',
    type: 'Cat',
    bio: 'Curiosa e muito dócil. Já usa a caixinha de areia sem nenhum problema e come ração seca sem frescura. Foi resgatada com os irmãos num terreno baldio e é a mais sociável da ninhada: vem receber visita na porta. Ainda não é castrada por causa da idade, e a ONG acompanha esse retorno.',
    adopted: false,
    created_at: '2026-08-11T12:00:00.000Z',
    city: 'Salvador',
    whatsapp: '5571999990002',
    photos: [],
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
    photos: [],
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Nina',
    orgId: 'org-recife',
    age: 3,
    size: 'Medium',
    type: 'Cat',
    bio: 'Tranquila e independente. Prefere casas sem muita agitação.',
    adopted: false,
    created_at: '2026-08-24T12:00:00.000Z',
    city: 'Recife',
    whatsapp: '5581999990004',
    photos: [],
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
    photos: [],
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
    photos: [],
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    name: 'Luna',
    orgId: 'org-recife',
    age: 1,
    size: 'Large',
    type: 'Dog',
    bio: 'Chegou magrinha e hoje é pura energia. Aprende comando novo em dois dias.',
    adopted: false,
    created_at: '2026-09-03T12:00:00.000Z',
    city: 'Recife',
    whatsapp: '5581999990005',
    photos: [],
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    name: 'Amora',
    orgId: 'org-fiel',
    age: 3,
    size: 'Small',
    type: 'Cat',
    bio: 'Resgatada de uma obra. Desconfiada no começo, grudenta depois da primeira semana.',
    adopted: false,
    created_at: '2026-09-05T12:00:00.000Z',
    city: 'Feira de Santana',
    whatsapp: '5575999990006',
    photos: [],
  },
]

export const normalizeCity = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
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

/* ── Área da ONG no modo demonstração ─────────────────────────────────────── */

const MOCK_ORG: ApiOrg = {
  id: 'org-patas',
  name: 'Patas Felizes',
  email: 'contato@patasfelizes.org',
  whatsapp: '5571999990001',
  city: 'Salvador',
  address: 'Rua das Acácias, 120 — Rio Vermelho',
  created_at: '2026-01-15T12:00:00.000Z',
}

/** JWT de mentira, só para o `sub` ser lido pelo mesmo código do fluxo real. */
function fakeToken(orgId: string): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: orgId, exp })}.demo`
}

/** No modo demonstração qualquer credencial entra — não há banco por trás. */
export async function mockAuthenticate(credentials: {
  email: string
  password: string
}): Promise<string> {
  await delay(600)
  if (!credentials.email || !credentials.password) {
    throw new Error('Informe e-mail e senha.')
  }
  return fakeToken(MOCK_ORG.id)
}

export async function mockOrg(id: string): Promise<ApiOrg> {
  await delay(300)
  return { ...MOCK_ORG, id }
}

/**
 * Pets cadastrados durante a demonstração. Ficam no navegador de quem está
 * testando para sobreviverem a um refresh — sem isso o pet somia logo depois
 * de ser publicado, que é justamente o momento que a tela promete.
 */
const DEMO_PETS_KEY = 'tailhop.demo-pets'

function loadDemoPets(): Pet[] {
  try {
    const raw = localStorage.getItem(DEMO_PETS_KEY)
    return raw ? (JSON.parse(raw) as Pet[]) : []
  } catch {
    return []
  }
}

PETS.unshift(...loadDemoPets())

/** Publica o pet na lista da demonstração, para o painel refletir o cadastro. */
export async function mockCreatePet(payload: CreatePetPayload): Promise<ApiPet> {
  await delay(700)

  const pet: Pet = {
    id: `mock-${Date.now()}`,
    name: payload.name,
    orgId: MOCK_ORG.id,
    age: payload.age,
    size: payload.size,
    type: payload.type,
    bio: payload.bio ?? null,
    adopted: false,
    created_at: new Date().toISOString(),
    city: MOCK_ORG.city,
    whatsapp: MOCK_ORG.whatsapp,
    photos: [],
  }

  PETS.unshift(pet)

  try {
    localStorage.setItem(DEMO_PETS_KEY, JSON.stringify([pet, ...loadDemoPets()]))
  } catch {
    // Navegador sem armazenamento: o pet ainda vale para esta sessão.
  }

  return pet
}

/**
 * Pets marcados como adotados durante a demonstração. Ficam guardados junto
 * com os cadastrados para que a baixa também sobreviva a um refresh.
 */
const DEMO_ADOPTED_KEY = 'tailhop.demo-adopted'

function loadAdoptedIds(): string[] {
  try {
    const raw = localStorage.getItem(DEMO_ADOPTED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

for (const id of loadAdoptedIds()) {
  const pet = PETS.find((candidate) => candidate.id === id)
  if (pet) pet.adopted = true
}

export async function mockSetAdopted(petId: string, adopted: boolean): Promise<void> {
  await delay(600)

  const pet = PETS.find((candidate) => candidate.id === petId)
  if (!pet) throw new Error('Este pet não está mais disponível.')
  pet.adopted = adopted

  try {
    const ids = new Set(loadAdoptedIds())
    if (adopted) ids.add(petId)
    else ids.delete(petId)
    localStorage.setItem(DEMO_ADOPTED_KEY, JSON.stringify([...ids]))
  } catch {
    // Navegador sem armazenamento: a mudança ainda vale para esta sessão.
  }
}

/** Espelha `GET /orgs/me/pets`: os pets da ONG, adotados inclusive. */
export async function mockOrgPets(org: ApiOrg): Promise<Pet[]> {
  await delay(550)
  return PETS.filter((pet) => pet.orgId === org.id)
}

/** Espelha a página de detalhes: o pet e a ONG que o publicou. */
export async function mockPetPage(petId: string): Promise<PetPage> {
  await delay(500)

  const pet = PETS.find((candidate) => candidate.id === petId)
  if (!pet) throw new ApiError('Este pet não está mais anunciado.', 404)

  return { pet, org: { ...MOCK_ORG, id: pet.orgId, city: pet.city } }
}

/* ── Fotos na demonstração ────────────────────────────────────────────────── */

/**
 * Sem R2 por trás, a foto vira uma data URL guardada no navegador. O caminho
 * é o mesmo do fluxo real — pedir, subir, confirmar — só que sem rede, então a
 * tela exercita os mesmos estados de progresso e erro.
 */
export async function mockUploadPhoto(
  petId: string,
  file: File,
  onProgress: (ratio: number) => void,
): Promise<ApiPetImage> {
  const pet = PETS.find((candidate) => candidate.id === petId)
  if (!pet) throw new ApiError('Este pet não está mais anunciado.', 404)
  if (pet.photos.length >= MAX_PHOTOS_PER_PET) {
    throw new ApiError(`Um pet pode ter no máximo ${MAX_PHOTOS_PER_PET} fotos.`, 409)
  }

  for (let step = 1; step <= 5; step++) {
    await delay(140)
    onProgress(step / 5)
  }

  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new ApiError('Não foi possível ler o arquivo.'))
    reader.readAsDataURL(file)
  })

  const image: ApiPetImage = {
    id: `img-${Date.now()}`,
    petId,
    key: `pets/${petId}/${Date.now()}`,
    url,
    created_at: new Date().toISOString(),
  }

  pet.photos = [...pet.photos, image]
  persistDemoPet(pet)
  return image
}

export async function mockDeletePhoto(petId: string, imageId: string): Promise<void> {
  await delay(400)
  const pet = PETS.find((candidate) => candidate.id === petId)
  if (!pet) throw new ApiError('Este pet não está mais anunciado.', 404)

  pet.photos = pet.photos.filter((photo) => photo.id !== imageId)
  persistDemoPet(pet)
}

/** Mantém no navegador o pet alterado durante a demonstração. */
function persistDemoPet(pet: Pet) {
  try {
    const others = loadDemoPets().filter((stored) => stored.id !== pet.id)
    localStorage.setItem(DEMO_PETS_KEY, JSON.stringify([pet, ...others]))
  } catch {
    // Navegador sem armazenamento: a mudança vale só para esta sessão.
  }
}

/* ── Conta na demonstração ────────────────────────────────────────────────── */

/** Simula a latência de um endpoint que só responde 200. */
export const mockDelay = () => delay(700)

/**
 * Na demonstração, um token que comece com `expirado` reproduz o caminho de
 * falha; qualquer outro verifica. Sem isso não haveria como conferir a tela de
 * link inválido sem um backend.
 */
export async function mockVerifyEmail(token: string): Promise<void> {
  await delay(900)
  if (!token || token.startsWith('expirado')) {
    throw new ApiError('Este link de verificação expirou ou já foi usado.', 400)
  }
}
