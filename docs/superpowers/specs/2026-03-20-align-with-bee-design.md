# Align cacoo-cli with nulab/bee patterns

## Context

cacoo-cli is a CLI for the Cacoo diagramming service, structured as a Bun monorepo. nulab/bee is a CLI for Backlog (same org). This design aligns cacoo-cli's implementation patterns with bee where applicable.

## Package Names

| Package | Name | Private |
|---------|------|---------|
| CLI app | `@simochee/cacoo-cli` | false |
| API client | `@repo/cacoo-api` | true |
| CLI utilities | `@repo/cli-utils` | true |
| Config | `@repo/config` | true |
| Test utilities | `@repo/test-utils` | true |

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

- `loadConfig()`: Read and validate with valibot. Return default `{ }` if missing.
- `writeConfig(config)`: Persist to disk via rc9.
- `updateConfig(updater)`: Atomic read-modify-write.
- `updateAuth(auth)`: Shorthand for updating auth field.
- `resolveAuth()`: Env vars (`CACOO_API_KEY`) > config file.
- `resolveOrganization(override?)`: CLI flag > env var (`CACOO_ORGANIZATION`) > config `defaultOrganization`.
- `getConfigPath()`: Return config file location.

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

### Command Injection in `login.ts`
- Current: uses shell string interpolation for opening browser
- Fix: use `execFile` with argument array

## 5. API Client

### Non-JSON Response Handling
- Current: `rawRequest` unconditionally calls `response.json()`
- Fix: Check content-type header, fall back to `response.text()` for non-JSON

### `api.ts` Fixes
- Argument description: add PATCH to method list
- `--body` option: rename metavar from `<json>` to `<pairs>` to match implementation

## 6. Toolchain

- **Keep Bun** for workspaces, build, and test
- **Add dependencies**: consola, rc9, valibot
- **No changes** to oxlint, TypeScript config

## Non-Goals

- No pnpm/unbuild migration (staying with Bun)
- No vitest migration (staying with bun:test)
- No multi-space support (Cacoo has no space/host concept)
- No documentation site (unlike bee's Astro Starlight)
