import { AGE_RANGE } from './format'
import {
  mockAuthenticate,
  mockCreatePet,
  mockFeaturedPets,
  mockOrg,
  mockOwnOrg,
  mockDeletePhoto,
  mockOrgPets,
  mockPetPage,
  mockSearchPets,
  mockDelay,
  mockSetAdopted,
  mockUploadPhoto,
  mockVerifyEmail,
} from './mock'
import type {
  ApiOrg,
  ApiOrgForReview,
  ApiOwnOrg,
  DocumentConfirmation,
  DocumentType,
  OrgDocumentKind,
  OrgStatus,
  ReviewDecision,
  CnpjCheck,
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
  ResetPasswordPayload,
  UploadTicket,
} from './types'

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

/**
 * Dados fictícios existem para desenvolver sem subir o backend — e só para
 * isso. Em produção eles são um risco: sem `VITE_API_URL`, o site mostraria
 * pets inventados com WhatsApp que não existe para gente procurando adotar de
 * verdade. Por isso o fallback é restrito ao build de desenvolvimento; em
 * produção, a falta da variável derruba toda chamada com uma mensagem clara.
 */
export const usingMockData = BASE_URL === '' && import.meta.env.DEV

/** Erro de rede/HTTP com uma mensagem que pode ser mostrada na tela. */
export class ApiError extends Error {
  status?: number
  /** Campos recusados pelo Zod, quando a API manda o detalhe. */
  fields?: string[]

  constructor(message: string, status?: number, fields?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }

  /** Sessão ausente ou expirada: quem chamou deve mandar a ONG para o login. */
  get isUnauthorized() {
    return this.status === 401
  }
}

/**
 * Token de acesso da ONG. Fica só em memória, nunca no `localStorage`: um
 * script injetado na página leria o storage, mas não alcança esta variável.
 * Vale 15 minutos; quem o renova é `renewSession`, a partir do cookie
 * `httpOnly` que o JavaScript nem enxerga.
 */
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

let sessionEndedListener: (() => void) | null = null

/** O `AuthProvider` se registra aqui para saber quando a sessão morreu no meio do uso. */
export function onSessionEnded(listener: (() => void) | null) {
  sessionEndedListener = listener
}

interface RequestOptions extends RequestInit {
  /** Anexa o `Authorization` da sessão; a chamada falha com 401 sem ela. */
  authenticated?: boolean
}

async function send(path: string, init?: RequestOptions): Promise<Response> {
  const headers = new Headers(init?.headers)

  // Só quem tem corpo declara o tipo. Mandar `Content-Type` num GET faria o
  // navegador disparar um preflight CORS à toa em toda busca.
  if (init?.body) headers.set('Content-Type', 'application/json')
  if (init?.authenticated && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  try {
    return await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError('Não foi possível falar com o servidor. Verifique sua conexão.')
  }
}

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      'O site está sem a conexão com o servidor configurada. Avise a equipe do Tailhop.',
    )
  }

  let response = await send(path, init)

  // O token de acesso vence a cada 15 minutos, inclusive no meio de um
  // cadastro. Em vez de jogar a ONG para o login, renova pelo cookie e repete
  // a chamada uma vez. Só se a renovação falhar a sessão acabou de verdade.
  if (response.status === 401 && init?.authenticated) {
    const token = await renewSession().catch(() => null)

    if (token) {
      response = await send(path, init)
    } else {
      sessionEndedListener?.()
    }
  }

  if (!response.ok) {
    // Um 400 do Zod vem com `issues` dizendo qual campo falhou. Sem ler isso, a
    // tela mostrava "não foi possível concluir" e a pessoa ficava sem saber o
    // que corrigir — foi assim que um WhatsApp fora do formato E.164 virou um
    // erro mudo.
    const fields = await failedFields(response)
    throw new ApiError(messageForStatus(response.status, fields), response.status, fields)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Nomes como a pessoa os vê na tela, não como a API os chama. */
const FIELD_LABEL: Record<string, string> = {
  name: 'nome da ONG',
  city: 'cidade',
  address: 'endereço',
  whatsapp: 'WhatsApp',
  email: 'e-mail',
  password: 'senha',
  age: 'idade',
  size: 'porte',
  type: 'espécie',
  bio: 'descrição',
  cnpj: 'CNPJ',
  // Só falha se a página aberta for de antes de os termos mudarem.
  termsVersion: 'aceite dos termos (recarregue a página para ver a versão atual)',
}

interface ZodIssue {
  path?: (string | number)[]
}

async function failedFields(response: Response): Promise<string[] | undefined> {
  try {
    const body = (await response.clone().json()) as { issues?: ZodIssue[] }
    if (!body.issues?.length) return undefined

    const names = body.issues
      .map((issue) => issue.path?.[0])
      .filter((name): name is string => typeof name === 'string')

    return names.length ? [...new Set(names)] : undefined
  } catch {
    return undefined
  }
}

function messageForStatus(status: number, fields?: string[]): string {
  if (status === 401) return 'Sua sessão expirou. Entre de novo para continuar.'
  if (status === 403) return 'Esta conta não tem permissão para essa ação.'
  if (status === 409) return 'Limite atingido, ou o registro já existe.'
  // A API limita tentativas por hora; sem isto a pessoa recebia uma mensagem
  // genérica e tentava de novo, gastando o que restava do limite.
  if (status === 429) {
    return 'Muitas tentativas seguidas. Espere alguns minutos antes de tentar de novo.'
  }
  if (status >= 500) {
    return 'O servidor não respondeu como esperado. Tente de novo em instantes.'
  }
  if (status === 400 && fields?.length) {
    const labels = fields.map((field) => FIELD_LABEL[field] ?? field)
    return labels.length === 1
      ? `O campo ${labels[0]} está em um formato que o servidor não aceita.`
      : `Estes campos estão em um formato que o servidor não aceita: ${labels.join(', ')}.`
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
export async function fetchPetPage(
  id: string,
  { asOwner = false }: { asOwner?: boolean } = {},
): Promise<PetPage> {
  if (usingMockData) return mockPetPage(id)

  // A ONG ainda em análise só enxerga os próprios pets mandando o token: para
  // o público, pet de ONG não aprovada não existe.
  const pet = await request<ApiPetWithWhatsapp>(`/pets/${id}`, {
    authenticated: asOwner,
  })
  const org = await fetchOrg(pet.orgId).catch(() => null)

  return {
    pet: toPet(pet, org?.city ?? ''),
    org,
  }
}

/**
 * `POST /orgs` — cria a conta da ONG. Responde 409 se e-mail, WhatsApp ou CNPJ
 * já existem, e 422 se a Receita não conhece o CNPJ.
 */
export async function registerOrg(payload: OrgSignupPayload): Promise<void> {
  if (usingMockData) return mockDelay()
  await request('/orgs', { method: 'POST', body: JSON.stringify(payload) })
}

/* ── Área da ONG ──────────────────────────────────────────────────────────── */

/**
 * `POST /orgs/sessions` — devolve só o token; o perfil vem depois.
 *
 * `credentials: 'include'` é o que faz o navegador aceitar o cookie de refresh
 * vindo de outra origem (`api.` → site). Sem ele o `Set-Cookie` é descartado
 * em silêncio e a sessão não sobrevive a um recarregamento.
 */
export async function authenticateOrg(
  credentials: CredentialsPayload,
): Promise<string> {
  if (usingMockData) return mockAuthenticate(credentials)

  const { token } = await request<{ token: string }>('/orgs/sessions', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(credentials),
  })
  return token
}

let pendingRenewal: Promise<string | null> | null = null

/**
 * `POST /orgs/sessions/refresh` — troca o cookie por um token de acesso novo.
 * Devolve `null` quando não há sessão (cookie ausente, vencido ou revogado).
 *
 * Chamadas simultâneas compartilham uma renovação só. O backend gira o cookie
 * a cada uso, e várias requisições tomando 401 juntas renovariam todas com o
 * mesmo cookie — o que, passada a tolerância do backend, parece roubo e
 * derruba todas as sessões da ONG.
 *
 * Com dados fictícios não há cookie: a sessão de mentira some no recarregamento.
 */
export function renewSession(): Promise<string | null> {
  pendingRenewal ??= requestRenewal().finally(() => {
    pendingRenewal = null
  })
  return pendingRenewal
}

async function requestRenewal(): Promise<string | null> {
  if (usingMockData) return null

  try {
    const { token } = await request<{ token: string }>('/orgs/sessions/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    setAuthToken(token)
    return token
  } catch (cause) {
    if (cause instanceof ApiError && cause.isUnauthorized) {
      setAuthToken(null)
      return null
    }
    throw cause
  }
}

/** `DELETE /orgs/sessions` — revoga a sessão no servidor e apaga o cookie. */
export async function signOutOrg(): Promise<void> {
  if (usingMockData) return

  await request('/orgs/sessions', { method: 'DELETE', credentials: 'include' })
}

/**
 * `GET /orgs/me` — a própria ONG, com o andamento da verificação. É a fonte
 * da sessão: o perfil público (`GET /orgs/:id`) nem existe antes da aprovação.
 */
export async function fetchOwnOrg(): Promise<ApiOwnOrg> {
  if (usingMockData) return mockOwnOrg()
  return request<ApiOwnOrg>('/orgs/me', { authenticated: true })
}

/** `GET /orgs/:id` — perfil público de uma ONG aprovada. */
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

/* ── Recuperação de senha ─────────────────────────────────────────────────── */

/**
 * `POST /orgs/password/forgot` — dispara o e-mail com o link de redefinição.
 *
 * A API responde 200 mesmo para e-mail inexistente, de propósito: dizer "esta
 * conta não existe" entregaria a um atacante quais e-mails estão cadastrados.
 * A tela acompanha isso e mostra a mesma confirmação nos dois casos.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (usingMockData) return mockDelay()

  await request('/orgs/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

/**
 * `POST /orgs/password/reset` — troca a senha usando o token do e-mail.
 *
 * O token vale uma hora e some depois de usado; a API devolve 400 nos dois
 * casos, então a tela trata token inválido e expirado com a mesma saída: pedir
 * um link novo.
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  if (usingMockData) return mockDelay()

  await request('/orgs/password/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/* ── Verificação de e-mail ────────────────────────────────────────────────── */

/**
 * `GET /orgs/verify-email?token=` — confirma a conta pelo link do e-mail.
 *
 * É GET com o token na query, e sem cabeçalho customizado, então não dispara
 * preflight. O token vale 24 horas e serve uma vez; inválido, expirado ou já
 * usado respondem 400 igualmente.
 *
 * Reusar um token que já verificou responde 200: o backend tornou a rota
 * idempotente, então o antivírus de e-mail que abre o link antes da pessoa não
 * queima mais a conta. Só token nunca usado e expirado dá 400.
 */
export async function verifyEmail(token: string): Promise<void> {
  if (usingMockData) return mockVerifyEmail(token)

  await request(`/orgs/verify-email?token=${encodeURIComponent(token)}`)
}

/**
 * `POST /orgs/verify-email/resend` — manda outro link.
 *
 * Responde 200 mesmo para e-mail inexistente ou já verificado, para não
 * revelar quais contas existem. A tela mostra a mesma confirmação nos dois
 * casos. Limitado a cinco por hora, então um 429 aqui é esperado.
 */
export async function resendVerificationEmail(email: string): Promise<void> {
  if (usingMockData) return mockDelay()

  await request('/orgs/verify-email/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
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
      else reject(new ApiError('O envio do arquivo foi recusado pelo servidor de arquivos.', xhr.status))
    }
    xhr.onerror = () =>
      reject(new ApiError('Não foi possível enviar o arquivo. Verifique sua conexão.'))
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

/* ── Documentos da ONG ────────────────────────────────────────────────────── */

/**
 * Sobe um documento da ONG direto no bucket privado e confirma.
 *
 * Tipo e tamanho vão assinados na URL, então o arquivo enviado precisa ser
 * exatamente o que foi anunciado — o navegador manda `Content-Length` sozinho
 * a partir do `File`, e `putSignedFile` manda o mesmo `Content-Type`.
 */
export async function uploadOrgDocument(
  kind: OrgDocumentKind,
  file: File,
  onProgress: (ratio: number) => void = () => {},
): Promise<DocumentConfirmation> {
  if (usingMockData) {
    await mockDelay()
    return { status: 'Pending', documents: [{ kind, uploadedAt: new Date().toISOString() }] }
  }

  const ticket = await request<{ key: string; uploadUrl: string }>('/orgs/me/documents', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify({
      kind,
      contentType: file.type as DocumentType,
      size: file.size,
    }),
  })

  await putSignedFile(ticket.uploadUrl, file, onProgress)

  try {
    return await request<DocumentConfirmation>('/orgs/me/documents/confirm', {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify({ kind, key: ticket.key }),
    })
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 404) {
      throw new ApiError('O arquivo não chegou ao servidor. Tente enviar de novo.', 404)
    }
    throw cause
  }
}

/* ── Painel admin ─────────────────────────────────────────────────────────── */

/** `GET /admin/orgs` — ONGs num status, com a checagem do CNPJ e os documentos. */
export async function fetchOrgsForReview(status: OrgStatus): Promise<ApiOrgForReview[]> {
  if (usingMockData) return []
  return request<ApiOrgForReview[]>(`/admin/orgs?status=${status}`, { authenticated: true })
}

/** `POST /admin/orgs/:id/review` — aprova ou recusa; os documentos são apagados. */
export async function reviewOrg(orgId: string, decision: ReviewDecision): Promise<void> {
  await request(`/admin/orgs/${orgId}/review`, {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(decision),
  })
}

/** `POST /admin/orgs/:id/cnpj-check` — consulta a Receita de novo. */
export async function recheckOrgCnpj(orgId: string): Promise<CnpjCheck> {
  return request<CnpjCheck>(`/admin/orgs/${orgId}/cnpj-check`, {
    method: 'POST',
    authenticated: true,
  })
}
