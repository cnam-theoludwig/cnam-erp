# Development

## Development Environment

### Prerequisites

- [Bun](https://bun.com/) canary >= v1.4.4-canary.1 (`bun upgrade --canary`). No stable release ships `bun lint` and `bun fmt` yet.
- [Docker](https://www.docker.com/)

### Installation

```sh
# Clone the repository
git clone https://github.com/theoludwig/cnam-erp.git

# Go to the project root
cd cnam-erp

# Configure environment variables
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Install dependencies
bun install --frozen-lockfile
```

### Start the application

```sh
# Start the development Docker services (e.g: Database)
docker compose --file compose.dev.yaml up --detach

# Delete the volumes (e.g: to reset the database)
docker compose --file compose.dev.yaml down --volumes

# Database migrations and seeding
bun run database:migrate
bun run database:seed

# Development Web app and API server
bun run dev
```

#### Services (with default `.env.example`)

- [`apps/api`](../apps/api): <http://localhost:4500>
- [`apps/web`](../apps/web): <http://localhost:4000> (main application)
- [Mailpit](https://mailpit.axllent.org/): <http://localhost:8026>, SMTP port: `1026`
- [PostgreSQL](https://www.postgresql.org/) database, port: `5434`
- [Redis](https://redis.io/) (job queue), port: `6380`
- [AdminNeo](https://www.adminneo.org/): <http://localhost:4081>

#### Seeded accounts

`bun run database:seed` creates the following accounts, all with the password `test`:

| Name        | Email                     |
| ----------- | ------------------------- |
| Théo LUDWIG | `contact@theoludwig.fr`   |
| Mina TOUMA  | `mina.touma@example.com`  |
| Aude BRUANT | `aude.bruant@example.com` |

### Database

```sh
# Database migrations
bun run database:migrate

# Create a new migration (e.g: `add_user_avatar`)
bun run database:migrate:make -- add_user_avatar

# Generate the database types (`apps/api/src/tools/database/codegen.ts`) after a migration
bun run database:codegen

# Database seeding
bun run database:seed
```

### Scripts

```sh
# Hash a password
bun run --cwd apps/api password-hash

# Generate a secret (e.g: `AUTH_SECRET` in `apps/api/.env`)
bun run --cwd apps/api generate-secret

# Storybook (UI components): http://localhost:6006
bun run --cwd apps/web dev:storybook

# React Email preview (emails templates): http://localhost:3500
bun run --cwd apps/web dev:email
```

## Conventions

### Main Technologies/Frameworks/Libraries used

Monorepo using [Turborepo](https://turborepo.com/) with:

- [TypeScript](https://www.typescriptlang.org/): Programming language.
- [TanStack Start](https://tanstack.com/start)/[React](https://react.dev/): UI and main frontend.
- [oRPC](https://orpc.dev/): API and main backend.
    - [kysely](https://kysely.dev/): Type-safe SQL query builder.
    - [zod](https://zod.dev): Schema-based data validation.

Check npm deps with updates: `bun outdated --recursive`.

Pin GitHub actions deps to SHA: `bunx action-pinner@latest fix`.

Kill port (e.g: port 4500): `bunx kill-port@latest 4500`

### Linting/Formatting/Tests

- Linting: [`bun lint`](https://bun.com/docs/lint) (configured by [`.oxlintrc.json`](../.oxlintrc.json))
- Formatting: [`bun fmt`](https://bun.com/docs/format) (configured by [`.oxfmtrc.json`](../.oxfmtrc.json))
- Unit Tests: [Bun Test Runner](https://bun.com/docs/test) (`apps/api`, `shared/*`)
- Component Tests: [Vitest](https://vitest.dev/) browser mode with [Storybook](https://storybook.js.org/) stories (`apps/web`)

```sh
# Lint
bun run lint:fmt
bun run lint:turbo
bun run lint

# Format
bun run fmt

# Tests
bun run test

# Build
bun run build

# To execute a command in a specific package (e.g: shared/utils)
cd shared/utils
bun run test
```

The [CI pipeline](../.github/workflows/ci.yml) verifies code best practices and tests pass.

### Branching

`main` is the only permanent branch. Active development, features and fixes merge here.

Each feature/fix gets a dedicated branch from `main`: `feat/<feature-name>` or `fix/<bug-name>`. Open a PR for review, merge to `main`, delete the branch.

Releases live on ephemeral `release/*` branches. Delete them once tagged. Git tags are permanent and immutable, and the host deploys a tag:

- `v1.0.0-beta.1`: pre-release, for Quality Assurance (QA).
- `v1.0.0`: stable version, for `production`.

See [Production Environment / Release](./production.md#release) for the release process.

### Commit Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/) and [Semantic Versioning](https://semver.org/) for version/release management.

Commits must be **atomic**, following 3 rules:

- One subject only (feature, fix, etc.).
- Clear, concise message.
- Must not break CI or make repo incoherent.
