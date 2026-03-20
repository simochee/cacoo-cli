import { CacooCommand } from "../../lib/cacoo-command";
import { loadConfig, updateAuth } from "@repo/config";
import { CacooClient, refreshAccessToken } from "@repo/cacoo-api";
import { UserError } from "@repo/cli-utils";
import consola from "consola";

const refresh = new CacooCommand("refresh")
  .summary("Refresh the OAuth access token")
  .description("Manually refresh the OAuth access token using the stored refresh token.")
  .action(async () => {
    const config = loadConfig();
    const auth = config.auth;

    if (!auth || auth.method !== "oauth") {
      throw new UserError("Not authenticated with OAuth. Run `cacoo auth login --method oauth`.");
    }

    if (!auth.clientId || !auth.clientSecret) {
      throw new UserError("OAuth client credentials not stored. Re-authenticate with `cacoo auth login --method oauth`.");
    }

    const tokens = await refreshAccessToken({
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
      refreshToken: auth.refreshToken,
    });

    const client = new CacooClient({ accessToken: tokens.access_token });
    const account = await client.getAccount();

    updateAuth({
      method: "oauth",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
    });

    consola.info(`Token refreshed. Logged in as ${account.nickname ?? account.name}`);
  });

export default refresh;
