import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CacooConfig {
  apiKey?: string;
  baseUrl?: string;
}

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
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

export function updateConfig(partial: Partial<CacooConfig>): void {
  const current = loadConfig();
  saveConfig({ ...current, ...partial });
}

export function resolveApiKey(): string | undefined {
  return process.env.CACOO_API_KEY ?? loadConfig().apiKey;
}
