import { CacooCommand } from "../../lib/cacoo-command";
import { resolveApiKey, getConfigPath } from "@cacoo/config";
import { CacooClient } from "@cacoo/api";

const status = new CacooCommand("status")
  .summary("Show authentication status")
  .description("Display the current authentication status and account info.")
  .action(async () => {
    const apiKey = resolveApiKey();
    if (!apiKey) {
      console.log("Not logged in.");
      console.log(`Config file: ${getConfigPath()}`);
      process.exit(1);
    }

    const client = new CacooClient({ apiKey });
    try {
      const account = await client.getAccount();
      console.log(`Logged in as ${account.nickname ?? account.name}`);
      console.log(`Account type: ${account.type}`);
      console.log(`Config file: ${getConfigPath()}`);
    } catch {
      console.log("API key is set but could not verify.");
      console.log(`Config file: ${getConfigPath()}`);
    }
  });

export default status;
