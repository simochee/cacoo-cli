# Align cacoo-cli with nulab/bee patterns

## Context

cacoo-cli is a CLI for the Cacoo diagramming service, structured as a Bun monorepo. nulab/bee is a CLI for Backlog (same org). This design aligns cacoo-cli's implementation patterns with bee where applicable.

## Package Names

All workspace packages are renamed from `@cacoo/*` to `@repo/*` (private). All imports across the codebase must be updated accordingly.

| Package | Current Name | New Name | Private |
|---------|-------------|----------|---------|
| CLI app | `cacoo-cli` | `@simochee/cacoo-cli` | false |
| API client | `@cacoo/api` | `@repo/cacoo-api` | true |
| CLI utilities | `@cacoo/cli-utils` | `@repo/cli-utils` | true |
| Config | `@cacoo/config` | `@repo/config` | true |
| Test utilities | `@cacoo/test-utils` | `@repo/test-utils` | true |

## 1. Config Package (`@repo/config`)

### Current State
- Raw JSON file at `~/.config/cacoo-cli/config.json`
- No schema validation
- Single auth, flat structure

### Target State
- rc9-based config at `~/.config/cacoo-cli/config`
- valibot schema validation
- Discriminated union for auth method

### Schema

```typescript
import * as v from "valibot";

const ApiKeyAuthSchema = v.object({
  method: v.literal("api-key"),
  apiKey: v.string(),
});

const OAuthAuthSchema = v.object({
  method: v.literal("oauth"),
  accessToken: v.string(),
  refreshToken: v.string(),
  clientId: v.string(),
  clientSecret: v.string(),
});

const AuthSchema = v.variant("method", [ApiKeyAuthSchema, OAuthAuthSchema]);

const ConfigSchema = v.object({
  defaultOrganization: v.optional(v.string()),
  auth: v.optional(AuthSchema),
});

type CacooConfig = v.InferOutput<typeof ConfigSchema>;
```

### Functions

```typescript
loadConfig(): CacooConfig
writeConfig(config: CacooConfig): void
updateConfig(updater: (config: CacooConfig) => CacooConfig): void
updateAuth(auth: CacooAuth): void
resolveAuth(): { method: string; apiKey?: string; accessToken?: string } | undefined
resolveOrganization(override?: string): string | undefined
getConfigPath(): string
```

- `loadConfig()`: Read and validate with valibot. Return default `{ }` if missing.
- `writeConfig(config)`: Persist to disk via rc9.
- `updateConfig(updater)`: Atomic read-modify-write.
- `updateAuth(auth)`: Shorthand for updating auth field.
- `resolveAuth()`: Env vars (`CACOO_API_KEY`) > config file.
- `resolveOrganization(override?)`: CLI flag > env var (`CACOO_ORGANIZATION`) > config `defaultOrganization`. Accepts optional override from `--org` flag.
- `getConfigPath()`: Return config file location.

### Dependencies

- `rc9`: Config file management (added to `@repo/config`)
- `valibot`: Schema validation (added to `@repo/config`)

### OAuth Credentials Storage

OAuth `clientId` and `clientSecret` are stored in the config file alongside tokens (same pattern as bee). This is necessary for automatic token refresh on 401 responses. The config file is protected with `0o600` permissions. During login, `clientId`/`clientSecret` come from environment variables or interactive prompts, then are persisted for future refresh operations.

**Token refresh flow** (existing, unchanged):
1. API call returns 401
2. `client-factory.ts` Proxy intercepts, calls `refreshAccessToken(clientId, clientSecret, refreshToken)`
3. New tokens are saved to config via `updateAuth()`
4. Original request is retried

All four OAuth fields (`accessToken`, `refreshToken`, `clientId`, `clientSecret`) are required in the schema.

### Migration

The config file format changes from JSON (`config.json`) to rc9 format (`config`). Since this is a pre-release project with no existing users, no migration path is needed. The old `config.json` file can be manually deleted.

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `CACOO_API_KEY` | API key authentication |
| `CACOO_ORGANIZATION` | Override default organization |
| `CACOO_OAUTH_CLIENT_ID` | OAuth client ID |
| `CACOO_OAUTH_CLIENT_SECRET` | OAuth client secret |

## 2. CLI Utils (`@repo/cli-utils`)

### Current State
- `console.log` for output
- Manual table formatting
- `UserError` class

### Target State
- consola for styled output
- `outputResult()` with `--json` support and field filtering
- `printTable()` / `printDefinitionList()` using consola
- `promptRequired()`: Interactive input, throws `UserError` in non-TTY
- `confirmOrExit()`: Destructive operation confirmation, `--yes` to skip
- `UserError` stays as-is

### Key Functions (aligned with bee)

```typescript
// Output formatting
outputResult(data, args, formatter): void
printTable(rows): void
printDefinitionList(items): void

// Interactive
promptRequired(label, existing?, options?): Promise<string>
confirmOrExit(message, skipConfirm?): Promise<void>

// Parsing
splitArg(input, schema): string[]
```

## 3. Auth Commands

### `auth switch`
- Lists available organizations from API
- Sets `defaultOrganization` in config
- Supports `--org` flag for non-interactive use

### `--org` flag (all commands)
- Currently accepted but silently ignored
- Wire up: each command handler calls `resolveOrganization(options.org)`
- Pass resolved org to API calls where applicable

## 4. Security Fixes

### Command Injection in `open.ts`
- Current: uses shell string interpolation with unsanitized API response URL
- Fix: use `execFileSync` with argument array to bypass shell interpretation

```typescript
// macOS
execFileSync("open", [url]);
// Windows
execFileSync("cmd", ["/c", "start", "", url]);
// Linux
execFileSync("xdg-open", [url]);
```

### Command Injection in `login.ts`
- Current: uses shell string interpolation for opening browser
- Fix: use `execFile` with argument array (same pattern as open.ts)

## 5. API Client

### Non-JSON Response Handling
- Current: `rawRequest` unconditionally calls `response.json()`
- Fix: Check content-type header, fall back to `response.text()` for non-JSON

### `api.ts` Fixes
- Argument description: add PATCH to method list
- `--body` option: rename metavar from `<json>` to `<pairs>` to match implementation

## 6. Toolchain

- **Keep Bun** for workspaces, build, and test
- **Add dependencies**:
  - `@repo/config`: rc9, valibot
  - `@repo/cli-utils`: consola
- **No changes** to oxlint, TypeScript config

## Non-Goals

- No pnpm/unbuild migration (staying with Bun)
- No vitest migration (staying with bun:test)
- No multi-space support (Cacoo has no space/host concept)
- No documentation site (unlike bee's Astro Starlight)
