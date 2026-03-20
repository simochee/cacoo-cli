import { CacooClient, CacooApiError, refreshAccessToken } from "@repo/cacoo-api";
import { resolveAuth, resolveOrganization, updateAuth } from "@repo/config";
import type { OAuthAuth } from "@repo/config";
import { UserError } from "@repo/cli-utils";

export function createClient(): CacooClient {
  const auth = resolveAuth();
  if (!auth) {
    throw new UserError("Not authenticated. Run `cacoo auth login` or set CACOO_API_KEY.");
  }

  if (auth.method === "api-key") {
    return new CacooClient({ apiKey: auth.apiKey });
  }

  return createOAuthClient(auth);
}

function createOAuthClient(auth: OAuthAuth): CacooClient {
  let client = new CacooClient({ accessToken: auth.accessToken });
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

          if (!refreshPromise) {
            refreshPromise = (async () => {
              const tokens = await refreshAccessToken({
                clientId: auth.clientId,
                clientSecret: auth.clientSecret,
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

              const newClient = new CacooClient({ accessToken: newAuth.accessToken });
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
  return resolveOrganization(orgOverride);
}
