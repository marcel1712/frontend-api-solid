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

/**
 * O pet com o whatsapp da org dona junto. É o que `GET /pets/:id` e
 * `GET /pets/search` devolvem — a busca resolve o whatsapp no próprio use
 * case, sem query extra. Vem `''` quando a org não tem número.
 */
export interface ApiPetWithWhatsapp extends ApiPet {
  whatsapp: string
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
   * O schema do backend ainda não tem campo de imagem. Fica `null` até o
   * upload existir; o card cai para um ladrilho da marca nesse caso.
   */
  photoUrl: string | null
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
