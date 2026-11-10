FROM docker.io/oven/bun:canary-slim@sha256:4973f20e6c0d9d623b840801089e84311e9f9527bba07d590fb3b7348f111dd5 AS bun-base
WORKDIR /usr/src/app

FROM bun-base AS bun-turbo
RUN bun install --global turbo@2.11.10
ENV DO_NOT_TRACK=1
ENV TURBO_TELEMETRY_DISABLED=1

FROM bun-turbo AS builder
COPY ./ ./
RUN turbo prune @repo/api --docker --production

FROM bun-turbo AS installer
COPY .gitignore .gitignore
COPY --from=builder /usr/src/app/out/json/ ./
COPY --from=builder /usr/src/app/out/bun.lock ./bun.lock
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --frozen-lockfile --production
COPY --from=builder /usr/src/app/out/full/ ./
COPY turbo.json turbo.json

FROM bun-base AS runner
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 applicationgroup && useradd --system --uid 1001 --gid applicationgroup applicationuser
USER applicationuser
COPY --from=installer --chown=applicationuser:applicationgroup /usr/src/app ./
WORKDIR /usr/src/app/apps/api
CMD ["bun", "./src/server.ts"]
