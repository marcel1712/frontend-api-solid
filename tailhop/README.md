<div align="center">

<img src="public/favicon.png" width="88" alt="">

# Tailhop

**A pet adoption platform that connects animal shelters to people looking to adopt.**

Search for pets in your city, filter by age, size and species, and reach the
shelter straight on WhatsApp. Shelters sign in to publish the pets they rescue.

React 19 · TypeScript · Vite · Tailwind CSS v4

<!-- Once deployed, add the demo here:  **[Live demo](https://your-app.vercel.app)** · -->
**[Backend API →](https://github.com/marcel1712/api-solid)**

</div>

<br>

![Landing page](docs/home.png)

---

## About the project

Adoption happens through conversation, not checkout. Tailhop is built around
that: the product's job is discovery and the first contact, and it hands the
conversation over to WhatsApp rather than trying to own it.

This is the frontend. It consumes a REST API I also built —
[api-solid](https://github.com/marcel1712/api-solid), a Fastify + Prisma +
PostgreSQL service in a layered architecture (controllers → use cases →
repositories) with 110 passing tests.

Both codebases are mine, so this repo also shows how I work **across** a
boundary: several items below were fixed in the API because that was the right
layer for them, not patched in the client because it was quicker.

## Screens

| Pet listing | Shelter signup |
| --- | --- |
| ![Pet listing](docs/listing.png) | ![Shelter signup](docs/org-signup.png) |

The authenticated side, where a shelter publishes pets and closes the ads that
found a home:

| Sign in | Shelter dashboard | Publish a pet |
| --- | --- | --- |
| ![Shelter sign in](docs/org-login.png) | ![Shelter dashboard](docs/org-dashboard.png) | ![Publish a pet form](docs/new-pet.png) |

<table>
<tr>
<td width="50%"><img src="docs/mobile-home.png" alt="Landing page on mobile"></td>
<td width="50%"><img src="docs/mobile-listing.png" alt="Pet listing on mobile"></td>
</tr>
</table>

The interface is in Brazilian Portuguese, its intended audience.

## Tech stack

| | |
| --- | --- |
| **Framework** | React 19, TypeScript (strict), Vite |
| **Routing** | React Router 7 |
| **Styling** | Tailwind CSS v4, design tokens via `@theme` |
| **Icons** | lucide-react |
| **Quality** | ESLint with the React Compiler rules |
| **Hosting** | Vercel |

**Vite over Next.js.** The site is mostly static with a few client-side API
calls. SSR would have added configuration and a server runtime without buying
anything here, so the tradeoff didn't pay for itself.

**No component library.** The visual identity is specific enough that a kit
would have cost more in overrides than it saved. The handful of primitives the
project needs are built in-house and accessible.

## Engineering highlights

The parts I'd want a reviewer to look at:

**One API client, no scattered `fetch`.** Every request goes through
[`src/lib/api.ts`](src/lib/api.ts), typed against the backend's real contract.
Loading and error handling live in one hook, so no screen invents its own.

**Reading the API before writing the UI.** The approved design assumed data
the API didn't return. Rather than guess, I read the backend's Prisma schema
and controllers and reconciled the two. That review surfaced six mismatches;
three belonged in the API and were fixed there:

- **N+1 on search.** The listing needed each shelter's WhatsApp, which only the
  detail endpoint returned — one extra request per pet. Fixed in the use case,
  which now resolves the numbers from the orgs it had already loaded. Zero
  extra queries; the listing is a single request.
- **Age filtering.** The API matched `age` exactly, so the
  puppy/adult/senior chips couldn't be expressed and would have broken across
  pagination if faked client-side. Became an `ageMin`/`ageMax` range filter.
- **Adopted pets.** Search returned pets already adopted. Now excluded in the
  query, where it belongs, instead of being filtered out after transfer.

**A CORS bug caught by testing the contract, not the mock.** I ran the client
against a server mimicking the real API shape. It failed: I was sending
`Content-Type` on every request, including bodyless `GET`s, which promotes a
simple request into a preflighted one and fires an extra round trip on every
search. Now only requests with a body declare their type.

**Every state is designed, not just the happy path.** Loading uses skeletons
shaped like the real cards, so the layout doesn't jump. Empty results
distinguish "no pets in this city yet" from "your filters are too narrow" and
offer the matching next step. Errors say what to do and offer a retry.

**Accessibility as a floor, not a pass at the end.** Visible focus rings on
both light and brand backgrounds, labelled form fields, results announced via
`aria-live`, and buttons whose accessible names name the pet — a grid of
identical "Adopt" buttons is useless to a screen reader.

**Filters live in the URL.** A search survives a reload and can be shared.

**A confirmation step where the action is one-way.** Marking a pet as adopted
removes it from search, and since search never returns adopted pets there is
nowhere left in the UI to undo it. So the row asks once, inline, and spells out
the consequence — a modal for a one-line action is ceremony, but doing it on a
single click would be a trap. The row disappears the moment the API confirms,
without refetching a list the pet could no longer appear in.

**Session handling that doesn't fight the user.** The saved session is restored
synchronously, before the first render, so a refresh on a private page never
flashes the login screen and never lets a child fire an authenticated request
before the token is armed. An expired token is discarded on load rather than
after a failed submit, so a shelter doesn't fill in a whole form to be told to
log in again. A `401` mid-flow sends them to sign in instead of showing a dead
end.

**It works before the backend is deployed.** With no `VITE_API_URL` set, the
client serves fictional data with the same shape, so the site is demoable on
its own. Pointing it at the real API is one environment variable.

## Architecture

```
src/
├── assets/              # Logo and hero artwork
├── components/
│   ├── ui.tsx           # Button, Field, TextArea, Select, Callout
│   ├── button-styles.ts # One definition of the pill, shared by button and link
│   ├── PetCard.tsx      # The card, used by the home showcase and the listing
│   ├── RequireAuth.tsx  # Route guard for the shelter area
│   └── …                # Logo, CitySearch, Header, Footer, OrgShell
├── lib/
│   ├── api.ts           # Typed API client — every network call goes through here
│   ├── auth.tsx         # Session provider: sign in, sign out, restore
│   ├── types.ts         # API contracts, kept separate from the view model
│   ├── format.ts        # Portuguese labels, age ranges, WhatsApp links
│   ├── mock.ts          # Fictional data used when no API is configured
│   └── useRequest.ts    # Shared loading and error handling
└── pages/               # Home, Pets, OrgSignup, OrgLogin, OrgDashboard, NewPet
```

Three boundaries carry most of the weight:

**API types vs. view model.** `ApiPet` mirrors the backend exactly. `Pet` is
what the UI renders and adds what the screen knows but the endpoint doesn't —
the searched city, and a `photoUrl` slot for when image upload ships. The
translation happens once, in the client, so no component knows about the gap.

**One card, two screens.** `PetCard` is the same component in the home
showcase and the full listing. A pet with no photo gets a brand tile rather
than a stock image; a shelter with no number shows that plainly rather than
linking to a broken `wa.me` address.

**Public site vs. shelter area.** Everything authenticated goes through
`AuthProvider`, and `api.ts` holds the token so no component passes it around.
The access token is kept in `localStorage`: the API's refresh cookie is
`httpOnly` and `SameSite=Strict`, so it can't be used from a frontend on
another domain, which rules out a silent-refresh flow. That's a deliberate
tradeoff — `localStorage` is readable by any injected script — and the honest
fix is a `SameSite=None; Secure` refresh cookie on the API, not a
sleight-of-hand on the client.

## Running locally

```bash
npm install
npm run dev
```

With no `VITE_API_URL`, the app runs on built-in fictional data. To point it at
the API, copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:3333
```

```bash
npm run build   # type-check and production build
npm run lint    # ESLint with the React Compiler rules
```

## Deployment

Built for Vercel. It's a SPA, so `vercel.json` rewrites all routes to
`index.html` — without that, a direct visit to `/pets` 404s. Set `VITE_API_URL`
in the project's environment variables.

> **The API needs `@fastify/cors` registered** before a deployed frontend can
> reach it, since the browser calls it cross-origin. Read requests are
> deliberately preflight-free `GET`s, so a basic origin allowlist is enough.

## Notes and next steps

Deliberately out of scope for now, and why:

- **Pet photos.** The backend has no image column yet. `Pet.photoUrl` already
  exists in the view model and stays `null`, so adding `photoUrl String?` and
  populating it is a one-line change here.
- **Shelter signup is demonstrative.** It validates and confirms, but posts
  nothing — a public portfolio form shouldn't write to a real database.
  `registerOrg` is written and typed against `POST /orgs`; wiring it up is one
  call. Note the API also requires `password` and `address`, which the approved
  design doesn't collect.
- **`GET /orgs/me/pets`.** The dashboard reuses the public city search and keeps
  the shelter's own pets, because the API has no "my pets" endpoint. That
  inherits two limits: only the first page of the city, and adopted pets are
  invisible since the search excludes them. That second limit is why marking a
  pet as adopted is one-way in the UI: the API accepts `adopted: false`, but a
  reverted pet would have no screen to be reverted from.
- **`Ferret` can't be registered.** The Prisma enum spells it `Ferret` but the
  register controller validates against `"Furret"`, so neither spelling passes
  both layers. The option is left out of the form until the API is fixed —
  offering a choice that always fails is worse than not offering it.

---

<div align="center">

Portfolio project — all data is fictional.

</div>
