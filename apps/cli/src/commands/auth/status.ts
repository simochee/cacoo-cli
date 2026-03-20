import { CacooCommand } from "../../lib/cacoo-command";
import { resolveAuth, resolveOrganization, getConfigPath } from "@repo/config";
import { CacooClient } from "@repo/cacoo-api";
import consola from "consola";

const status = new CacooCommand("status")
  .summary("Show authentication status")
  .description("Display the current authentication status, account info, and active organization.")
  .action(async () => {
    const auth = resolveAuth();
    if (!auth) {
      consola.info("Not logged in.");
      consola.info(`Config file: ${getConfigPath()}`);
      process.exit(1);
    }

    consola.info(`Auth method: ${auth.method}`);

    const clientOptions =
      auth.method === "api-key"
        ? { apiKey: auth.apiKey }
        : { accessToken: auth.accessToken };

    const client = new CacooClient(clientOptions);
    try {
      const account = await client.getAccount();
      consola.info(`Logged in as ${account.nickname ?? account.name}`);
      consola.info(`Account type: ${account.type}`);
    } catch {
      consola.info("Credentials are set but could not verify.");
    }

    const org = resolveOrganization();
    if (org) {
      consola.info(`Organization: ${org}`);
    }
    consola.info(`Config file: ${getConfigPath()}`);
  });

export default status;
