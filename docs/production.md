# Production Environment

See [Development / Branching](./development.md#branching) for the branching model.

## Overview

| Trigger                  | CI does                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Push to `release/*`      | Runs the full test suite, then builds and pushes Docker images `sha-<sha>` for `web`, `api` |
| Push tag `v1.0.0-beta.1` | Re-tags `sha-<sha>` as `1.0.0-beta.1` and `beta`. No rebuild.                               |
| Push tag `v1.0.0`        | Re-tags `sha-<sha>` as `1.0.0` and `latest`. No rebuild.                                    |

Git tags keep the `v` (`v1.0.0`), docker tags drop it (`1.0.0`).

### Registry

Images live in the [GitHub Container Registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry):

- `ghcr.io/theoludwig/cnam-erp-web`
- `ghcr.io/theoludwig/cnam-erp-api`

| Docker tag  | Meaning                                                |
| ----------- | ------------------------------------------------------ |
| `1.0.0`     | Immutable, one per release                             |
| `beta`      | Latest pre-release                                     |
| `latest`    | Latest production release                              |
| `sha-<sha>` | One per `release/*` push, full 40-character commit SHA |

## Release

```sh
git checkout -b release/v1.0.0 main
git push
```

1. Wait for CI to go green. The `build-push` job pushes Docker images `sha-<sha>` for `web` and `api`.
2. Create the release with tag `v1.0.0` on the release branch. The `deploy` job runs in seconds.
3. Deploy on the host (see [Deployment](#deployment)).
4. Delete the release branch: `git push origin --delete release/v1.0.0`.

## Deployment

### Host

The host holds:

```text
cnam-erp/
  compose.yaml
  .env
  apps/api/.env
  apps/web/.env
```

Copy the `.env.example` files to `.env` and adapt them to the host. In `apps/api/.env`, set `DATABASE_HOST=cnam-erp-database` and `DATABASE_PORT=5432`. Replace every `secret` and `password` value (`bun run --cwd apps/api generate-secret` generates a secret). The `EMAIL_*` variables in `apps/api/.env` point to the SMTP server of the host.

```sh
cd cnam-erp

# Pull the images of a version and start the services
VERSION=1.0.0 docker compose pull
VERSION=1.0.0 docker compose up --detach
```

### Services (default `.env.example`)

- `apps/api`: <http://localhost:4500>
- `apps/web`: <http://localhost:4000>

```sh
# To execute commands in a service (e.g: `cnam-erp-api`)
docker compose exec cnam-erp-api bash

# To see the logs of a service (e.g: `cnam-erp-api`)
docker compose logs --follow cnam-erp-api

# To see the status of all services
docker compose ps

# Database migrations
docker compose exec cnam-erp-api bun run database:migrate

# Database seeding
docker compose exec cnam-erp-api bun run database:seed

# Execute a database query
docker compose exec cnam-erp-database bash
psql --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"
\dt
```
