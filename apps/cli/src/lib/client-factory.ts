import { CacooClient } from "@cacoo/api";
import { resolveApiKey, loadConfig } from "@cacoo/config";
import { UserError } from "@cacoo/cli-utils";

export function createClient(): CacooClient {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new UserError("No API key found. Run `cacoo auth login` or set CACOO_API_KEY.");
  }
  const config = loadConfig();
  return new CacooClient({ apiKey, baseUrl: config.baseUrl });
}
