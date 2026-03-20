import { CacooCommand } from "../../lib/cacoo-command";
import { resolveAuth, resolveOrganization, getConfigPath } from "@repo/config";
import { CacooClient } from "@repo/cacoo-api";

const status = new CacooCommand("status")
  .summary("Show authentication status")
  .description("Display the current authentication status, account info, and active organization.")
  .action(async () => {
    const auth = resolveAuth();
    if (!auth) {
      console.log("Not logged in.");
      console.log(`Config file: ${getConfigPath()}`);
      process.exit(1);
    }

    console.log(`Auth method: ${auth.method}`);

    const clientOptions =
      auth.method === "api-key"
        ? { apiKey: auth.apiKey }
        : { accessToken: auth.accessToken };

    const client = new CacooClient(clientOptions);
    try {
      const account = await client.getAccount();
      console.log(`Logged in as ${account.nickname ?? account.name}`);
      console.log(`Account type: ${account.type}`);
    } catch {
      console.log("Credentials are set but could not verify.");
    }

    const org = resolveOrganization();
    if (org) {
      console.log(`Organization: ${org}`);
    }
    console.log(`Config file: ${getConfigPath()}`);
  });

export default status;
