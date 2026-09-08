# Tailhop — frontend

Interface da plataforma de adoção de pets que conecta ONGs a pessoas
interessadas em adotar. O contato final acontece no WhatsApp, fora da
plataforma: o site cuida da descoberta, da busca e da conexão inicial.

Consome a [API do Tailhop](https://github.com/marcel1712/api-solid) — Fastify,
Prisma e PostgreSQL, em arquitetura de camadas.

## Stack

React 19 + TypeScript, Vite, React Router 7, Tailwind CSS v4 e lucide-react.
Componentes são próprios: o design é específico o bastante para que uma
biblioteca pronta custasse mais em sobrescrita do que economizaria.

## Rodando

```bash
npm install
npm run dev
```

Sem `VITE_API_URL` o site roda com dados fictícios embutidos
(`src/lib/mock.ts`), então ele funciona em deploy antes do backend estar
hospedado. Para apontar para a API real, copie `.env.example` para `.env`:

```env
VITE_API_URL=http://localhost:3333
```

`npm run build` gera o `dist/`; `npm run lint` roda o ESLint com as regras do
React Compiler.

## Estrutura

```
src/
├── assets/          # logo e imagem da hero
├── components/      # Logo, PetCard, CitySearch, Header, Footer
├── lib/
│   ├── api.ts       # cliente tipado — todo fetch passa por aqui
│   ├── types.ts     # contratos da API + modelo de view
│   ├── format.ts    # rótulos em português, faixas de idade, link do WhatsApp
│   ├── mock.ts      # dados fictícios de fallback
│   └── useRequest.ts# loading/erro para chamadas de rede
└── pages/           # Home, Pets, OrgSignup, NotFound
```

O `PetCard` é o mesmo componente na vitrine da home e na listagem completa.

## Deploy

Pensado para a Vercel. É uma SPA, então o `vercel.json` reescreve todas as
rotas para o `index.html`; sem isso um acesso direto a `/pets` daria 404.
Configure `VITE_API_URL` nas variáveis de ambiente do projeto.

## Como o frontend consome a busca

`GET /pets/search` entrega tudo o que a listagem precisa em uma requisição:
o pet, o `whatsapp` da org dona junto, adotados já fora e a faixa etária
filtrada no banco. O cliente não refiltra nada — o que chega é o que aparece.

Os chips filhote/adulto/idoso viram `ageMin`/`ageMax` na chamada. As faixas
estão definidas uma única vez em `AGE_RANGE` (`lib/format.ts`), em anos:

| Chip    | Faixa       | Query                  |
| ------- | ----------- | ---------------------- |
| Filhote | menos de 1  | `ageMax=0`             |
| Adulto  | 1 a 7       | `ageMin=1&ageMax=7`    |
| Idoso   | 8 ou mais   | `ageMin=8`             |

O que ainda é resolvido do lado do frontend, e por quê:

- **Cidade do pet.** O Pet não carrega cidade — todo pet da resposta pertence
  a uma org da cidade buscada, então o card usa a cidade da própria busca.
- **Unidade de `age`.** Lida como anos, em `formatAge`, alinhado ao backend.
- **`whatsapp` vazio.** A API devolve `''` quando a org não tem número; o card
  cai para o estado sem contato em vez de gerar um link `wa.me` quebrado.
- **Foto do pet.** Não existe campo de imagem no schema. `Pet.photoUrl` já
  está no modelo de view e fica `null` — nesse caso o card mostra um ladrilho
  da marca em vez de uma foto genérica. Quando o backend ganhar um
  `photoUrl: String?`, é só popular esse campo em `toPet`.

## Antes de publicar: CORS na API

O backend ainda não registra `@fastify/cors`. Como o frontend chama a API
direto do navegador, de um domínio diferente (Vercel → onde a API estiver
hospedada), **todas as buscas falham sem isso** — a tela mostra o estado de
erro, não pets. No `app.ts` da API:

```ts
import cors from '@fastify/cors'
app.register(cors, { origin: [/* domínio do frontend */], credentials: true })
```

`credentials: true` importa se a área da ONG for usar o refresh cookie
`httpOnly` mais para frente. As requisições de leitura do site são GETs sem
cabeçalho customizado, de propósito: assim o navegador não dispara preflight
em toda busca.

## Cadastro de ONG

O formulário é demonstrativo e não envia nada, como o aviso na tela diz.
`registerOrg` em `lib/api.ts` já está pronto para `POST /orgs` — integrar é
trocar a chamada em `pages/OrgSignup.tsx`. Note que a API exige `password` e
`address`, dois campos que o formulário atual não pede.
