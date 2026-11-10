# Agents

STUD'RP is an ERP to manage student associations, sold under the name of each association (white label). See [docs/sujet.md](./docs/sujet.md).

## Monorepo

```text
apps/api/          - @repo/api (oRPC + OpenAPI, Kysely, Node.js HTTP server)
apps/web/          - @repo/web (React + TanStack + Radix UI + Tailwind CSS + i18n use-intl)
shared/api-client/ - @repo/api-client (typed oRPC fetch client)
shared/models/     - @repo/models (Zod schemas + pure domain types and functions logic for entities)
shared/utils/      - @repo/utils (pure utilities, agnostic of project and dependencies)
```

## During Implementation

```bash
bun run fmt
bun run lint
```

`bun run lint` also type-checks the whole monorepo. Never run `tsc` or `bun check`, because `bun run lint` already covers them.

## Prose/Documentation/i18n

- No em dashes (`—`) or en dashes (`–`). Use a comma, parentheses, or split the sentence in two.
- No semicolons. Two independent clauses are two sentences.
- No "smart" quotes or ellipsis characters (`“ ” ‘ ’ …`). Plain `"`, `'` and `...`.
- Active voice, present tense. "The router validates the input", not "the input is validated by the router". In UI copy, passive is fine when the system acts automatically and naming an actor would be forced: "The order is declined automatically".

## General Conventions

- Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb.
- Keep things simple and look for ways to reduce complexity. Channel "yagni" unless told otherwise.
- Code self-explanatory. When tempted to explain code with a comment, rewrite the code so the comment is unnecessary (extract a named function, name an intermediate variable, or narrow a type).
- Naming: no abbreviations or acronyms (`user` not `usr`, `configuration` not `cfg`, `expression` not `eb`).
- Related fields share a prefix: `reviewAverageRating`, `reviewCount`, not `averageRating`, `count`.
- Write a value the way existing code already writes it. Before inserting into a column, find another writer of that column (route, seed) and match its types and helpers.
- Performance by default:
    - Run independent async work in parallel with `Promise.all` (or `Promise.allSettled`).
    - Batch I/O: one query for many rows, not one query per item in a loop (see Database).
    - Mutate in place, arguments included. The caller copies when it still needs the original, and the mutated field's JSDoc says so (`CalculateDateInput.date`). Never mutate data that something else holds on to (React state, props, caches, module constants).

### Type References

Reference other entity types. Relationships stay explicit and survive refactors.

```typescript
interface BarInput {
    entranceDate: Person["entranceDate"] // not Date | null
}
```

### Zod Schemas (`@repo/models`)

Three-step pattern: plain object → Zod object → inferred type.

```typescript
export const FooZod = { id: EntityZod.id, name: z.string().trim().min(2).max(50) }
export const FooZodObject = z.object(FooZod)
export type Foo = z.infer<typeof FooZodObject>
```

URL search params: every field is `getDefaultCatchZod(schema, defaultValue)`, so invalid values fall back silently.

### Shared Utils (`@repo/utils`)

Prefer existing helpers over ad-hoc logic: `array`, `configuration`, `crypto`, `date`, `function`, `math`, `object`, `string`.

Derive constants from utils rather than writing magic numbers, so the constant carries its unit:

```typescript
// BAD
const DELIVERY_TIME_MAX_DAYS = 90
const DURATION = 60 * 60 * 1_000

// GOOD
const DELIVERY_TIME_MAX_DURATION = {
    amount: 90,
    unit: "day",
} as const satisfies Duration
const DURATION = calculateMillisecondsFromDuration({ duration: { amount: 1, unit: "hour" } })
```

A constant earns its name through reuse. Write a value inline when a single place uses it. A test that imports the constant counts as reuse.

### Testing (General)

Arrange-Act-Assert with these exact comments. Input, output and expected are always named variables.

```typescript
it("should reject a callback path that leaves the origin", () => {
    // Arrange - Given
    const input = "//evil.example"

    // Act - When
    const output = CallbackZodBasic.safeParse(input).success

    // Assert - Then
    const expected = false
    assert.strictEqual(output, expected)
})
```

Test names and test helpers speak the domain's vocabulary: "the password reset email", not "the nodemailer sendMail call". The third-party service stays an implementation detail of its wrapper in `tools/`, so a vendor swap leaves test names true.

Tests verify behavior through public interfaces, not implementation details. The code can change entirely. The tests should not. A good test reads like a specification: "should never revoke a session of another user" tells exactly what capability exists, and it survives refactors because it does not care about the internal structure.

A rule's value lives in its constant, and tests derive from it, so changing the constant breaks no test. Build values from the constant (`PASSWORD_MIN_LENGTH - 1`, `USER_DISPLAY_NAME_MAX_LENGTH + 1`) and name the rule in the test name ("shorter than the minimum length", not "shorter than 8 characters"). Literals stay fine for a test's own inputs and for what follows from them.

## Frontend Conventions (`apps/web`)

### React Components

- Components are `React.FC`. Destructure `props` in the body.
- Empty props interface is fine. It makes adding props later a non-change.
- Container/UI split: `Foo.tsx` fetches, `FooUI.tsx` is pure presentational.

### File Structure

A component lives where its consumers are.

- `Design/`: UI primitives with no business entity (only `@repo/models/Entity` and `FileData`).
- `Layout/`: the app shell. `i18n/`: locale, price and timezone UI.
- `DataDisplay/<Entity>/`: domain components used by 2 or more feature areas, grouped by the `@repo/models` file of the type they render.
- `routes/**/-components/`: components used by one feature area, a page and its child routes (`routes/auth/`). The `-` prefix keeps them out of the route tree.

A component moves up when a second feature area uses it, moves down when one is left, and is deleted when none are. It lives in its own folder next to its stories (a single file if it has none), and its sub-components live inside that folder.

### Routing

- `beforeLoad` for data fetching via `context.queryClient.query(...)`.
- `head` returns `{ meta: seo({...}) }`.
- `validateSearch` with Zod + `stripSearchParams`.

### Tailwind CSS

`classNames(...)` for every conditional or merged class list.

Colors come from design tokens only, declared in `apps/web/src/styles.css`.

### i18n

`fr-FR` is the source of truth and the default locale, `en-GB` is the other supported locale. All user-facing strings go through `useTranslations()`. Never hardcode copy in components. `useFormatter()` for numbers and dates.

Update both `fr-FR` and `en-GB`.

### Prices

A price is integer cents next to its currency (`Price` of `@repo/models/I18n`), stored as two columns (`priceCents` + `priceCurrency`, the `Currency` database enum). Display it with `PriceDisplay`.

### Data Fetching

`apiClientQuery` for oRPC + React Query. `createServerFn` for server-only logic (auth/i18n preferences cookies).

Every page lives under `/user` and is private: `routes/user/route.tsx` redirects to `/auth/sign-in` when signed out, and exposes `auth` in the route context.

### Testing (Frontend)

Vitest + `@testing-library/react` (Playwright, Chromium headless). Storybook tests via `@storybook/addon-vitest`, stories alongside components.

```bash
cd apps/web && bun run test
```

Query by role and accessible name. Same Arrange-Act-Assert comments as everywhere else.

```typescript
Foo.test("should do something", async ({ canvas, userEvent, args }) => {
    // Arrange - Given
    const button = await canvas.findByRole("button")

    // Act - When
    await userEvent.click(button)

    // Assert - Then
    await expect(args.onAction).toHaveBeenCalledWith("expected-value")
})
```

## Backend Conventions (`apps/api`)

### Endpoint Structure

Each endpoint is 3 files in `src/routes/<domain>/<domain.action>/`: `*.contract.ts` (HTTP contract), `*.router.ts` (handler), `*.test.ts`.

The contract `description` is one sentence in domain words: what the route does, and for whom. The schemas document the shape, and the tests document the errors and rules.

### File Structure

Code lives where its consumers are.

- `routes/<area>/`: endpoints, and the helpers only that route area uses (`routes/auth/`).
- `domain/<Entity>/`: queries and transitions used by 2 or more route areas, or by `_test/` or `tools/`, grouped by the `@repo/models` file of the entity they act on.
- `_test/`: test helpers used by 2 or more route areas.

A helper moves up to `domain/` when a second route area uses it, and moves down when one is left. Lint enforces the directions: a route area never imports another route area, and code outside `routes/` imports only the API router and contracts.

### Database (Kysely)

Types are generated (`bun run database:codegen`).

Schema changes go through a migration (`bun run database:migrate:make -- migration_name`).

- Avoid raw SQL. Use the expression builder, which stays type-checked against the schema:

    ```ts
    // BAD
    .select(sql<number>`coalesce(max("Package"."position"), -1)`.as("maxPosition"))

    // GOOD
    .select((expression) => {
      return expression.fn
        .coalesce(expression.fn.max("Package.position"), expression.val(-1))
        .as("maxPosition")
    })
    ```

- `jsonArrayFrom(...)` / `jsonObjectFrom(...)` for nested data: one query, never N+1.
- No aliases with acronyms or abbreviations, use full table names.
- Performance-first: prefer one statement over multiple round-trips (batch inserts, parallel data + count queries).
- Read the outcome of a write from the rows it returns, never from a caught database error. An insert uses `onConflict(...).doNothing()` with `returning`. An update puts its guard in the `where` (a `not exists` on the conflicting row) with `returning`. No row back means the write was refused, and the handler throws the `ORPCError`.
- Lock a row with `.forNoKeyUpdate()`. Use `.forUpdate()` only when the transaction deletes the row or changes one of its unique columns. `.forUpdate()` also blocks every insert that references the row through a foreign key.
- Kysely docs: <https://kysely.dev/llms-full.txt>

### Errors

Throw `ORPCError` with a semantic code, never return an error-shaped success. Handlers use `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`.

API messages are for developers, never for users. The frontend discriminates on the code and machine-readable `data`, then renders its own translated copy.

Messages and `data` never carry stack traces, SQL, third-party responses or secrets. Unexpected errors are logged server-side and reach the client as a bare `INTERNAL_SERVER_ERROR`.

### External Services

Third-party SDKs are wrapped behind a client in `tools/`. Do not import the vendor SDK from routers. Wrapper has a matching fake used by tests.

Emails go through `SendEmailJob.dispatch(...)`. The job asks the web app to render the React Email template (`apps/web/src/Email/`, `POST /api/email`), then `emailClient` sends it over SMTP (Mailpit in development).

### Queue

Class-based jobs in `src/jobs/`, dispatched with `Job.dispatch(payload)`, backed by Redis. Anything slow, retryable, or third-party belongs in a job, not in a request handler.

```typescript
export class SendEmailJob extends Job<EmailInput> {
    static override options: JobOptions = { name: "SendEmailJob", maxRetries: 3 }
    async execute(): Promise<void> {}
}
```

Tests assert on the dispatched jobs with `QueueManager.fake()` (`fake.assertPushed(SendEmailJob, ...)`).

### Testing (Backend)

`bun:test` + `node:assert/strict`. Real PostgreSQL and Redis via testcontainers.

```bash
cd apps/api && bun run test
```

```typescript
it('should return "UNAUTHORIZED" when no authorization header', async () => {
    // Arrange - Given
    const input: ApiInputs["auth"]["get"] = { headers: {} }
    const context = getTestContext(input.headers)

    // Act - When
    const output = call(apiRouter.auth.get, input, { context })

    // Assert - Then
    const expected = new ORPCError("UNAUTHORIZED")
    await assert.rejects(output, expected)
})
```

#### Key Rules

- Drive tests through the public API (`call(apiRouter.x.y, ...)`). Use `_test/` helpers only when no route exists.
- Verify mutations by reading them back through a get route, not from the mutation's return value.
- Multi-user tests for anything authorization-related (alice/bob pattern).
- Assert on the calls a fake recorded, including that nothing was called when it shouldn't be.

## Accounts

Nobody signs up on their own. An administrator creates the accounts (not built yet), and the seed (`bun run database:seed`) creates the accounts of the team.

## Not yet in place

Cron, rate limiting and telemetry follow the structure of Fusey (`cron/`, `tools/rateLimiter/`, `tools/telemetry/`) when added. Rate limiting plugs into `publicProcedure` and `authenticatedProcedure` of `apps/api/src/oRPC.ts`.
