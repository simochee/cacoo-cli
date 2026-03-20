import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type { ApiKeyAuth, OAuthAuth, CacooAuth, CacooConfig } from "./types";
import type { CacooAuth, CacooConfig } from "./types";

const CONFIG_DIR = join(homedir(), ".config", "cacoo-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): CacooConfig {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  const raw = readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(raw) as CacooConfig;
}

export function saveConfig(config: CacooConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
}

export function updateConfig(partial: Partial<CacooConfig>): void {
  const current = loadConfig();
  saveConfig({ ...current, ...partial });
}

export function updateAuth(auth: CacooAuth): void {
  updateConfig({ auth });
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

export function resolveOrganization(): string | undefined {
  return process.env.CACOO_ORGANIZATION ?? loadConfig().organization;
}
