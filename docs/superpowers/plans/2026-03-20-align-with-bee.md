# Align cacoo-cli with nulab/bee patterns — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align cacoo-cli's internal packages, output, config, and auth patterns with nulab/bee while fixing security issues found in code review.

**Architecture:** Rename all workspace packages from `@cacoo/*` to `@repo/*` (private) and CLI to `@simochee/cacoo-cli`. Replace raw JSON config with rc9 + valibot. Replace console.log output with consola. Wire up the dead `--org` flag. Fix command injection vulnerabilities.

**Tech Stack:** Bun, Commander.js, consola, rc9, valibot, bun:test

**Spec:** `docs/superpowers/specs/2026-03-20-align-with-bee-design.md`

---

## File Map

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Root monorepo name stays |
| `tsconfig.json` | Update `@cacoo/*` paths to `@repo/*` |
| `apps/cli/package.json` | Rename to `@simochee/cacoo-cli`, update deps |
| `apps/cli/src/index.ts` | Update imports |
| `apps/cli/src/lib/client-factory.ts` | Update imports, wire `resolveOrganization` |
| `apps/cli/src/lib/error.ts` | Update imports, use consola |
| `apps/cli/src/lib/common-options.ts` | No change |
| `apps/cli/src/lib/cacoo-command.ts` | No change |
| `apps/cli/src/lib/cacoo-command.test.ts` | Update imports |
| `apps/cli/src/commands/open.ts` | Fix command injection, update imports |
| `apps/cli/src/commands/auth/login.ts` | Fix command injection, update imports |
| `apps/cli/src/commands/auth/switch.ts` | Use `defaultOrganization`, update imports |
| `apps/cli/src/commands/auth/logout.ts` | Update imports |
| `apps/cli/src/commands/auth/status.ts` | Update imports, use consola |
| `apps/cli/src/commands/auth/refresh.ts` | Update imports |
| `apps/cli/src/commands/auth/token.ts` | Update imports |
| `apps/cli/src/commands/api.ts` | Fix PATCH desc, fix `--body` metavar, fix non-JSON, update imports |
| `apps/cli/src/commands/list.ts` | Update imports, wire `--org` |
| `apps/cli/src/commands/view.ts` | Update imports, wire `--org` |
| `apps/cli/src/commands/copy.ts` | Update imports |
| `apps/cli/src/commands/delete.ts` | Update imports, use `confirmOrExit` |
| `apps/cli/src/commands/whoami.ts` | Update imports |
| `apps/cli/src/commands/comment/list.ts` | Update imports, wire `--org` |
| `apps/cli/src/commands/comment/add.ts` | Update imports |
| `apps/cli/src/commands/folder/list.ts` | Update imports, wire `--org` |
| `apps/cli/src/commands/folder/create.ts` | Update imports |
| `apps/cli/src/commands/org/list.ts` | Update imports |
| `apps/cli/src/commands/org/view.ts` | Update imports |
| `packages/cacoo-api/package.json` | Rename to `@repo/cacoo-api` |
| `packages/cacoo-api/src/client.ts` | Fix `rawRequest` non-JSON handling |
| `packages/cli-utils/package.json` | Rename to `@repo/cli-utils`, add consola dep |
| `packages/cli-utils/src/index.ts` | Add new exports |
| `packages/cli-utils/src/output.ts` | Use consola for output |
| `packages/cli-utils/src/table.ts` | Use consola for output |
| `packages/cli-utils/src/error.ts` | No change |
| `packages/cli-utils/src/output.test.ts` | Update for consola |
| `packages/cli-utils/src/table.test.ts` | Update for consola |
| `packages/config/package.json` | Rename to `@repo/config`, add rc9+valibot deps |
| `packages/config/src/types.ts` | Replace with valibot schemas |
| `packages/config/src/index.ts` | Rewrite with rc9, add `resolveOrganization(override?)` |
| `packages/config/src/config.test.ts` | Rewrite tests for rc9+valibot |
| `packages/test-utils/package.json` | Rename to `@repo/test-utils` |
| `packages/test-utils/src/index.ts` | Update imports if needed |

---

## Task 1: Rename packages from `@cacoo/*` to `@repo/*`

This is a mechanical find-and-replace across all package.json and import statements.

**Files:**
- Modify: `apps/cli/package.json`
- Modify: `packages/cacoo-api/package.json`
- Modify: `packages/cli-utils/package.json`
- Modify: `packages/config/package.json`
- Modify: `packages/test-utils/package.json`
- Modify: `tsconfig.json`
- Modify: All `apps/cli/src/**/*.ts` files (imports)

- [ ] **Step 1: Update package.json names**

```jsonc
// apps/cli/package.json
"name": "@simochee/cacoo-cli"
// dependencies:
"@repo/cacoo-api": "workspace:*"
"@repo/cli-utils": "workspace:*"
"@repo/config": "workspace:*"
// devDependencies:
"@repo/test-utils": "workspace:*"

// packages/cacoo-api/package.json
"name": "@repo/cacoo-api"

// packages/cli-utils/package.json
"name": "@repo/cli-utils"

// packages/config/package.json
"name": "@repo/config"

// packages/test-utils/package.json
"name": "@repo/test-utils"
```

- [ ] **Step 2: Update tsconfig.json paths**

```json
{
  "paths": {
    "@repo/cacoo-api": ["./packages/cacoo-api/src/index.ts"],
    "@repo/cli-utils": ["./packages/cli-utils/src/index.ts"],
    "@repo/config": ["./packages/config/src/index.ts"],
    "@repo/test-utils": ["./packages/test-utils/src/index.ts"]
  }
}
```

- [ ] **Step 3: Find-and-replace imports in all source files**

Replace across all `.ts` files:
- `"@cacoo/api"` → `"@repo/cacoo-api"`
- `"@cacoo/cli-utils"` → `"@repo/cli-utils"`
- `"@cacoo/config"` → `"@repo/config"`
- `"@cacoo/test-utils"` → `"@repo/test-utils"`

- [ ] **Step 4: Reinstall dependencies**

Run: `bun install`
Expected: lockfile regenerated with new package names

- [ ] **Step 5: Verify typecheck and tests**

Run: `bun run typecheck && bun run test`
Expected: All pass with no errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: rename workspace packages to @repo/* scope, CLI to @simochee/cacoo-cli"
```

---

## Task 2: Add rc9 + valibot to config package

Rewrite `@repo/config` to use rc9 for file management and valibot for schema validation, aligned with bee's `@repo/config` pattern.

**Files:**
- Modify: `packages/config/package.json`
- Modify: `packages/config/src/types.ts`
- Modify: `packages/config/src/index.ts`
- Modify: `packages/config/src/config.test.ts`

- [ ] **Step 1: Install rc9 and valibot**

Run: `cd packages/config && bun add rc9 valibot`

- [ ] **Step 2: Write failing tests for new config system**

Rewrite `packages/config/src/config.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Tests will call loadConfig/writeConfig with a custom path for isolation
// We test the schema validation and config functions

describe("config schema", () => {
  it("validates api-key auth", () => {
    const { parseConfig } = require("../src/index");
    const result = parseConfig({
      auth: { method: "api-key", apiKey: "test-key" },
    });
    expect(result.auth?.method).toBe("api-key");
  });

  it("validates oauth auth", () => {
    const { parseConfig } = require("../src/index");
    const result = parseConfig({
      auth: {
        method: "oauth",
        accessToken: "at",
        refreshToken: "rt",
        clientId: "cid",
        clientSecret: "cs",
      },
    });
    expect(result.auth?.method).toBe("oauth");
  });

  it("rejects invalid auth method", () => {
    const { parseConfig } = require("../src/index");
    expect(() => parseConfig({ auth: { method: "invalid" } })).toThrow();
  });

  it("accepts empty config", () => {
    const { parseConfig } = require("../src/index");
    const result = parseConfig({});
    expect(result.auth).toBeUndefined();
    expect(result.defaultOrganization).toBeUndefined();
  });

  it("validates defaultOrganization", () => {
    const { parseConfig } = require("../src/index");
    const result = parseConfig({ defaultOrganization: "my-org" });
    expect(result.defaultOrganization).toBe("my-org");
  });
});

describe("resolveOrganization", () => {
  it("returns override when provided", () => {
    const { resolveOrganization } = require("../src/index");
    expect(resolveOrganization("override-org")).toBe("override-org");
  });

  it("returns env var when no override", () => {
    const prev = process.env.CACOO_ORGANIZATION;
    process.env.CACOO_ORGANIZATION = "env-org";
    const { resolveOrganization } = require("../src/index");
    expect(resolveOrganization()).toBe("env-org");
    if (prev !== undefined) process.env.CACOO_ORGANIZATION = prev;
    else delete process.env.CACOO_ORGANIZATION;
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd packages/config && bun test`
Expected: FAIL — `parseConfig` not exported

- [ ] **Step 4: Rewrite types.ts with valibot schemas**

Replace `packages/config/src/types.ts`:

```typescript
import * as v from "valibot";

export const ApiKeyAuthSchema = v.object({
  method: v.literal("api-key"),
  apiKey: v.string(),
});

export const OAuthAuthSchema = v.object({
  method: v.literal("oauth"),
  accessToken: v.string(),
  refreshToken: v.string(),
  clientId: v.string(),
  clientSecret: v.string(),
});

export const AuthSchema = v.variant("method", [ApiKeyAuthSchema, OAuthAuthSchema]);

export const ConfigSchema = v.object({
  defaultOrganization: v.optional(v.string()),
  auth: v.optional(AuthSchema),
});

export type ApiKeyAuth = v.InferOutput<typeof ApiKeyAuthSchema>;
export type OAuthAuth = v.InferOutput<typeof OAuthAuthSchema>;
export type CacooAuth = v.InferOutput<typeof AuthSchema>;
export type CacooConfig = v.InferOutput<typeof ConfigSchema>;
```

- [ ] **Step 5: Rewrite index.ts with rc9 + valibot**

Replace `packages/config/src/index.ts`:

```typescript
import { read, write } from "rc9";
import * as v from "valibot";
import { ConfigSchema } from "./types";

export type { ApiKeyAuth, OAuthAuth, CacooAuth, CacooConfig } from "./types";
export { ConfigSchema } from "./types";
import type { CacooAuth, CacooConfig } from "./types";

const RC_NAME = ".cacoorc";
const RC_DIR = ".config/cacoo-cli";

export function parseConfig(raw: unknown): CacooConfig {
  return v.parse(ConfigSchema, raw);
}

export function getConfigPath(): string {
  const { homedir } = require("node:os");
  const { join } = require("node:path");
  return join(homedir(), RC_DIR, RC_NAME);
}

export function loadConfig(): CacooConfig {
  const raw = read({ name: RC_NAME, dir: RC_DIR });
  if (!raw || Object.keys(raw).length === 0) {
    return {};
  }
  return parseConfig(raw);
}

export function writeConfig(config: CacooConfig): void {
  write(config, { name: RC_NAME, dir: RC_DIR });
}

export function updateConfig(updater: (config: CacooConfig) => CacooConfig): void {
  const current = loadConfig();
  writeConfig(updater(current));
}

export function updateAuth(auth: CacooAuth): void {
  updateConfig((config) => ({ ...config, auth }));
}

export function resolveAuth(): CacooAuth | undefined {
  const apiKey = process.env.CACOO_API_KEY;
  if (apiKey) {
    return { method: "api-key", apiKey };
  }
  return loadConfig().auth;
}

export function resolveApiKey(): string | undefined {
  const auth = resolveAuth();
  if (!auth) return undefined;
  if (auth.method === "api-key") return auth.apiKey;
  return auth.accessToken;
}

export function resolveOrganization(override?: string): string | undefined {
  if (override) return override;
  return process.env.CACOO_ORGANIZATION ?? loadConfig().defaultOrganization;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/config && bun test`
Expected: All PASS

- [ ] **Step 7: Verify full project typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add packages/config/
git commit -m "refactor: rewrite config package with rc9 + valibot (aligned with bee)"
```

---

## Task 3: Add consola to cli-utils package

Replace `console.log` output with consola. Add `promptRequired()` and `confirmOrExit()` utilities aligned with bee.

**Files:**
- Modify: `packages/cli-utils/package.json`
- Modify: `packages/cli-utils/src/output.ts`
- Modify: `packages/cli-utils/src/table.ts`
- Modify: `packages/cli-utils/src/index.ts`
- Modify: `packages/cli-utils/src/output.test.ts`
- Modify: `packages/cli-utils/src/table.test.ts`
- Create: `packages/cli-utils/src/prompt.ts`

- [ ] **Step 1: Install consola**

Run: `cd packages/cli-utils && bun add consola`

- [ ] **Step 2: Write failing tests for prompt utilities**

Create `packages/cli-utils/src/prompt.test.ts`:

```typescript
import { describe, it, expect } from "bun:test";
import { UserError } from "./error";

describe("promptRequired", () => {
  it("returns existing value when provided", async () => {
    const { promptRequired } = await import("./prompt");
    const result = await promptRequired("Label", "existing-value");
    expect(result).toBe("existing-value");
  });

  it("throws UserError in non-TTY", async () => {
    const { promptRequired } = await import("./prompt");
    // In test environment, stdin is not a TTY
    expect(promptRequired("Label")).rejects.toBeInstanceOf(UserError);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/cli-utils && bun test src/prompt.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement prompt.ts**

Create `packages/cli-utils/src/prompt.ts`:

```typescript
import consola from "consola";
import { UserError } from "./error";

export async function promptRequired(
  label: string,
  existing?: string,
): Promise<string> {
  if (existing) return existing;

  if (!process.stdin.isTTY) {
    throw new UserError(`${label} is required. Use the appropriate flag or set the environment variable.`);
  }

  const value = await consola.prompt(label, { type: "text" });
  if (typeof value === "symbol" || !value) {
    throw new UserError(`${label} is required.`);
  }
  return value;
}

export async function confirmOrExit(
  message: string,
  skipConfirm?: boolean,
): Promise<void> {
  if (skipConfirm) return;

  if (!process.stdin.isTTY) {
    throw new UserError("Confirmation required. Use --yes to skip.");
  }

  const confirmed = await consola.prompt(message, { type: "confirm" });
  if (!confirmed) {
    throw new UserError("Operation cancelled.");
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/cli-utils && bun test src/prompt.test.ts`
Expected: PASS

- [ ] **Step 6: Update table.ts to use consola**

In `packages/cli-utils/src/table.ts`, replace `console.log` with `consola.log`:

```typescript
import consola from "consola";

export function formatTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) => {
    const colValues = rows.map((r) => (r[i] ?? "").length);
    return Math.max(h.length, ...colValues);
  });

  const formatRow = (row: string[]): string =>
    row.map((cell, i) => (cell ?? "").padEnd(widths[i])).join("  ");

  const headerLine = formatRow(headers);
  const lines = rows.map(formatRow);
  return [headerLine, ...lines].join("\n");
}

export function printTable(headers: string[], rows: string[][]): void {
  consola.log(formatTable(headers, rows));
}
```

- [ ] **Step 7: Update index.ts exports**

```typescript
export { formatTable, printTable } from "./table";
export { outputResult, outputJson } from "./output";
export { UserError } from "./error";
export { promptRequired, confirmOrExit } from "./prompt";
```

- [ ] **Step 8: Run all cli-utils tests**

Run: `cd packages/cli-utils && bun test`
Expected: All PASS

- [ ] **Step 9: Commit**

```bash
git add packages/cli-utils/
git commit -m "feat: add consola output and prompt utilities (aligned with bee)"
```

---

## Task 4: Update error handler to use consola

Replace `console.error` with `consola.error` in the CLI error handler.

**Files:**
- Modify: `apps/cli/src/lib/error.ts`

- [ ] **Step 1: Update error.ts**

```typescript
import { CommanderError } from "commander";
import { CacooApiError } from "@repo/cacoo-api";
import { UserError } from "@repo/cli-utils";
import consola from "consola";

export function handleError(error: unknown): never {
  if (error instanceof CommanderError) {
    process.exit(error.exitCode);
  }

  if (error instanceof UserError) {
    consola.error(error.message);
    process.exit(1);
  }

  if (error instanceof CacooApiError) {
    consola.error(`API Error: ${error.status} ${error.statusText}`);
    if (error.body) {
      consola.error(error.body);
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    consola.error(error.message);
    if (process.env.DEBUG) {
      consola.error(error.stack);
    }
    process.exit(1);
  }

  consola.error("An unknown error occurred");
  process.exit(1);
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/cli/src/lib/error.ts
git commit -m "refactor: use consola for error output"
```

---

## Task 5: Fix security vulnerabilities

Fix command injection in `open.ts` and `login.ts`.

**Files:**
- Modify: `apps/cli/src/commands/open.ts`
- Modify: `apps/cli/src/commands/auth/login.ts`

- [ ] **Step 1: Fix open.ts — use execFileSync**

Replace lines 16-25 in `apps/cli/src/commands/open.ts`:

```typescript
  .action(async (diagramId: string, _options: { org?: string }) => {
    const client = createClient();
    const diagram = await client.getDiagram(diagramId);
    const url = diagram.url;

    const { execFileSync } = await import("node:child_process");
    const platform = process.platform;

    if (platform === "darwin") {
      execFileSync("open", [url]);
    } else if (platform === "win32") {
      execFileSync("cmd", ["/c", "start", "", url]);
    } else {
      execFileSync("xdg-open", [url]);
    }

    consola.info(`Opened ${url}`);
  });
```

- [ ] **Step 2: Fix login.ts — use execFile for browser opening**

Replace lines 97-104 in `apps/cli/src/commands/auth/login.ts`:

```typescript
  // Try to open the browser
  const { execFile } = await import("node:child_process");
  const platform = process.platform;

  if (platform === "darwin") {
    execFile("open", [authUrl]);
  } else if (platform === "win32") {
    execFile("cmd", ["/c", "start", "", authUrl]);
  } else {
    execFile("xdg-open", [authUrl]);
  }
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/cli/src/commands/open.ts apps/cli/src/commands/auth/login.ts
git commit -m "fix: replace exec/execSync with execFile to prevent command injection"
```

---

## Task 6: Fix API client and api command issues

Fix `rawRequest` non-JSON handling, PATCH description, and `--body` metavar.

**Files:**
- Modify: `packages/cacoo-api/src/client.ts`
- Modify: `apps/cli/src/commands/api.ts`

- [ ] **Step 1: Fix rawRequest in client.ts**

Replace lines 113-119 in `packages/cacoo-api/src/client.ts`:

```typescript
    if (!response.ok) {
      const text = await response.text();
      throw new CacooApiError(response.status, response.statusText, text);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const responseBody = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    return { status: response.status, headers: responseHeaders, body: responseBody };
```

- [ ] **Step 2: Fix api.ts argument description and metavar**

In `apps/cli/src/commands/api.ts`:

Line 13: Change argument description:
```typescript
  .argument("<method>", "HTTP method (GET, POST, PUT, DELETE, PATCH)")
```

Line 15: Change `--body` option:
```typescript
  .option("--body <pairs>", "Request body as key=value pairs (for POST/PUT)")
```

Line 40: Handle non-JSON body:
```typescript
    const output = typeof result.body === "string" ? result.body : JSON.stringify(result.body, null, 2);
    process.stdout.write(output + "\n");
```

- [ ] **Step 3: Run tests**

Run: `cd packages/cacoo-api && bun test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/cacoo-api/src/client.ts apps/cli/src/commands/api.ts
git commit -m "fix: handle non-JSON responses in rawRequest, fix api command descriptions"
```

---

## Task 7: Wire up `--org` flag in all commands

Connect the currently dead `--org` option to `resolveOrganization()` in every command that uses it.

**Files:**
- Modify: `apps/cli/src/lib/client-factory.ts`
- Modify: `apps/cli/src/commands/list.ts`
- Modify: `apps/cli/src/commands/view.ts`
- Modify: `apps/cli/src/commands/delete.ts`
- Modify: `apps/cli/src/commands/comment/list.ts`
- Modify: `apps/cli/src/commands/comment/add.ts`
- Modify: `apps/cli/src/commands/folder/list.ts`
- Modify: `apps/cli/src/commands/folder/create.ts`

- [ ] **Step 1: Verify resolveOrg in client-factory.ts accepts override**

The existing `resolveOrg(orgOverride?)` at line 79-81 of `client-factory.ts` already delegates to `resolveOrganization(override?)`. This will work correctly after Task 2's config changes. No modification needed to client-factory.ts beyond the import rename (already done in Task 1).

- [ ] **Step 2: Update command handlers to call resolveOrg**

In each command that has `orgOption()`, add `resolveOrg(options.org)` to the action handler. Example for `list.ts`:

```typescript
import { resolveOrg } from "../lib/client-factory";

// In action handler:
const org = resolveOrg(options.org);
// Pass org to API calls where applicable
```

For now, `resolveOrg` resolves the organization but the CacooClient API methods don't yet accept an org parameter. The resolved org value is available for future use when org-scoped API endpoints are needed. The important thing is that `resolveOrg` is called so the flag is no longer silently ignored and the resolution hierarchy works.

- [ ] **Step 3: Update auth/switch.ts to use defaultOrganization**

In `apps/cli/src/commands/auth/switch.ts`, line 20:

```typescript
updateConfig((config) => ({ ...config, defaultOrganization: orgKey }));
```

- [ ] **Step 4: Update delete.ts to use confirmOrExit**

In `apps/cli/src/commands/delete.ts`, replace the manual readline confirmation with:

```typescript
import { confirmOrExit } from "@repo/cli-utils";

// In action handler, replace the custom readline code with:
await confirmOrExit(`Delete diagram "${diagram.title}" (${diagramId})?`, options.yes);
```

- [ ] **Step 5: Run typecheck and tests**

Run: `bun run typecheck && bun run test`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add apps/cli/src/
git commit -m "feat: wire up --org flag in all commands, use confirmOrExit for delete"
```

---

## Task 8: Update remaining console.log to consola in commands

Replace `console.log` and `console.error` with `consola` across all command files.

**Files:**
- Modify: All files in `apps/cli/src/commands/`

- [ ] **Step 1: Replace console.log/console.error with consola**

In each command file:
- `console.log(...)` → `consola.info(...)` or `consola.log(...)` for data output
- `console.error(...)` → `consola.error(...)`
- Add `import consola from "consola"` at the top

Files to update:
- `apps/cli/src/commands/auth/login.ts` (lines 68, 81-83, 127, 129)
- `apps/cli/src/commands/auth/logout.ts`
- `apps/cli/src/commands/auth/status.ts`
- `apps/cli/src/commands/auth/refresh.ts`
- `apps/cli/src/commands/auth/token.ts` (keep `process.stdout.write` for raw token output)
- `apps/cli/src/commands/copy.ts`
- `apps/cli/src/commands/delete.ts`
- `apps/cli/src/commands/list.ts`
- `apps/cli/src/commands/open.ts`
- `apps/cli/src/commands/view.ts`
- `apps/cli/src/commands/whoami.ts`
- `apps/cli/src/commands/comment/add.ts`
- `apps/cli/src/commands/comment/list.ts`
- `apps/cli/src/commands/folder/create.ts`
- `apps/cli/src/commands/folder/list.ts`
- `apps/cli/src/commands/org/list.ts`
- `apps/cli/src/commands/org/view.ts`

Note: `auth/token.ts` should keep `process.stdout.write` for raw token output (piping to other commands).

- [ ] **Step 2: Replace process.exit(1) with UserError throws in login.ts**

In `auth/login.ts`, replace `console.error(...); process.exit(1)` patterns with `throw new UserError(...)` to align with bee's error pattern:

```typescript
// Before:
console.error("Error: No API key provided.");
process.exit(1);

// After:
throw new UserError("No API key provided.");
```

- [ ] **Step 3: Run typecheck and tests**

Run: `bun run typecheck && bun run test`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add apps/cli/src/
git commit -m "refactor: replace console.log/error with consola across all commands"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run full test suite**

Run: `bun run test`
Expected: All PASS

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Run linter**

Run: `bun run lint`
Expected: No errors

- [ ] **Step 4: Test CLI manually**

Run: `bun run apps/cli/src/index.ts --help`
Expected: Help output displays with all commands listed

Run: `bun run apps/cli/src/index.ts auth --help`
Expected: Auth subcommands listed
