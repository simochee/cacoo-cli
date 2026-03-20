import { CacooClient, CacooApiError, refreshAccessToken } from "@cacoo/api";
import { resolveAuth, resolveOrganization, loadConfig, updateAuth } from "@cacoo/config";
import type { OAuthAuth } from "@cacoo/config";
import { UserError } from "@cacoo/cli-utils";

export function createClient(): CacooClient {
  const auth = resolveAuth();
  if (!auth) {
    throw new UserError("Not authenticated. Run `cacoo auth login` or set CACOO_API_KEY.");
  }

  const config = loadConfig();
  const baseUrl = config.baseUrl;

  if (auth.method === "api-key") {
    return new CacooClient({ apiKey: auth.apiKey, baseUrl });
  }

  return createOAuthClient(auth, baseUrl);
}

function createOAuthClient(auth: OAuthAuth, baseUrl?: string): CacooClient {
  let client = new CacooClient({ accessToken: auth.accessToken, baseUrl });
  let refreshPromise: Promise<CacooClient> | undefined;

  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;

      return async (...args: unknown[]) => {
        try {
          return await (value as Function).apply(target, args);
        } catch (error) {
          if (!(error instanceof CacooApiError) || error.status !== 401) {
            throw error;
          }

          if (!auth.clientId || !auth.clientSecret || !auth.refreshToken) {
            throw new UserError(
              "OAuth token expired and cannot be refreshed. Run `cacoo auth login --method oauth`.",
            );
          }

          if (!refreshPromise) {
            refreshPromise = (async () => {
              const tokens = await refreshAccessToken({
                clientId: auth.clientId!,
                clientSecret: auth.clientSecret!,
                refreshToken: auth.refreshToken,
              });

              const newAuth: OAuthAuth = {
                method: "oauth",
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                clientId: auth.clientId,
                clientSecret: auth.clientSecret,
              };
              updateAuth(newAuth);
              auth.accessToken = newAuth.accessToken;
              auth.refreshToken = newAuth.refreshToken;

              const newClient = new CacooClient({ accessToken: newAuth.accessToken, baseUrl });
              client = newClient;
              return newClient;
            })();
          }

          const refreshedClient = await refreshPromise;
          refreshPromise = undefined;
          return await (refreshedClient as any)[prop](...args);
        }
      };
    },
  });
}

export function resolveOrg(orgOverride?: string): string | undefined {
  return orgOverride ?? resolveOrganization();
}
