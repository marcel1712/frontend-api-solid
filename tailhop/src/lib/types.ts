/* ── Contratos da API (espelham o schema Prisma do backend) ───────────────── */

/** Enum `AnimalSize` do Prisma. */
export type AnimalSize = 'Small' | 'Medium' | 'Large'

/** Enum `AnimalType` do Prisma. */
export type AnimalType =
  | 'Dog'
  | 'Cat'
  | 'Bird'
  | 'Fish'
  | 'Turtle'
  | 'Rabbit'
  | 'Hamster'
  | 'Ferret'
  | 'Chinchilla'

/** Model `Pet` como `GET /pets/search` devolve: sem org, sem cidade, sem foto. */
export interface ApiPet {
  id: string
  name: string
  orgId: string
  /** Idade em anos. Ver `formatAge` em `lib/format.ts`. */
  age: number
  size: AnimalSize
  type: AnimalType
  bio: string | null
  adopted: boolean
  created_at: string
}

/** Model `PetImage`: um arquivo no R2, já com a URL pública montada. */
export interface ApiPetImage {
  id: string
  petId: string
  key: string
  url: string
  created_at: string
}

/**
 * O pet com o whatsapp da org dona e as fotos junto. É o que `GET /pets/:id` e
 * `GET /pets/search` devolvem — ambos resolvem tudo no próprio use case, sem
 * query extra. O whatsapp vem `''` quando a org não tem número.
 */
export interface ApiPetWithWhatsapp extends ApiPet {
  whatsapp: string
  images: ApiPetImage[]
}

/** `GET /orgs/me/pets`: os pets da própria ONG, com fotos e incluindo adotados. */
export interface ApiOwnPet extends ApiPet {
  images: ApiPetImage[]
}

/** Model `Org` sem o `password_hash`, que a API nunca devolve. */
export interface ApiOrg {
  id: string
  name: string
  email: string
  whatsapp: string
  city: string
  address: string
  created_at: string
}

/* ── Modelo de view ───────────────────────────────────────────────────────── */

/**
 * O que o card precisa para renderizar. A API não entrega isso pronto:
 * `city` vem da busca (todas as orgs da página são daquela cidade) e
 * `whatsapp` vem de `GET /pets/:id`, resolvido no cliente de API.
 */
export interface Pet extends ApiPet {
  city: string
  whatsapp: string | null
  /**
   * Fotos publicadas, na ordem em que vieram. Guarda o registro inteiro, e não
   * só a URL, porque remover uma foto precisa do id. Vazio é estado normal.
   */
  photos: ApiPetImage[]
}

/* ── Filtros ──────────────────────────────────────────────────────────────── */

/**
 * Faixas etárias da interface, traduzidas para `ageMin`/`ageMax` na chamada —
 * ver `AGE_RANGE` em `lib/format.ts`. O filtro roda no banco, então atravessa
 * a paginação corretamente.
 */
export type AgeGroup = 'puppy' | 'adult' | 'senior'

/** Filtros da listagem. `city` é obrigatória: é regra de negócio da API. */
export interface PetSearchParams {
  city: string
  page?: number
  age?: AgeGroup
  size?: AnimalSize
  type?: AnimalType
}

/* ── Cadastro de ONG ──────────────────────────────────────────────────────── */

/** Corpo de `POST /orgs`. `password` e `address` são exigidos pela API. */
export interface OrgSignupPayload {
  name: string
  email: string
  password: string
  whatsapp: string
  city: string
  address: string
}

/* ── Área da ONG ──────────────────────────────────────────────────────────── */

/** Corpo de `POST /orgs/sessions`. */
export interface CredentialsPayload {
  email: string
  password: string
}

/**
 * `POST /pets`. A org vem do JWT, nunca do corpo — o backend ignora qualquer
 * `orgId` enviado aqui, e é isso que impede uma ONG de publicar em nome de outra.
 */
export interface CreatePetPayload {
  name: string
  age: number
  size: AnimalSize
  type: AnimalType
  bio?: string
}

/**
 * Sessão guardada no navegador. O backend devolve só o token; o id da org sai
 * do claim `sub` e o perfil vem de `GET /orgs/:id`.
 */
export interface Session {
  token: string
  org: ApiOrg
}

/** O que a página de detalhes precisa: o pet e a ONG que o publicou. */
export interface PetPage {
  pet: Pet
  /** `null` quando o perfil da ONG não pôde ser carregado. */
  org: ApiOrg | null
}

/* ── Upload de fotos ──────────────────────────────────────────────────────── */

/** Tipos que a API assina. O `PUT` precisa mandar exatamente o mesmo. */
export const UPLOADABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type UploadableType = (typeof UPLOADABLE_TYPES)[number]

/** Limite por pet imposto pelo backend; passar disso responde 409. */
export const MAX_PHOTOS_PER_PET = 3

/**
 * Resposta de `POST /pets/:id/images`. Nada foi gravado ainda: `key` identifica
 * o objeto para a confirmação, e `url` é onde ele vai ficar público.
 */
export interface UploadTicket {
  key: string
  url: string
  uploadUrl: string
}

/* ── Conta: recuperação e verificação ─────────────────────────────────────── */

/** Corpo de `POST /orgs/password/reset`. O token vem do link do e-mail. */
export interface ResetPasswordPayload {
  token: string
  password: string
}
