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
