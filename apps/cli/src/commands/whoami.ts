import { CacooCommand } from "../lib/cacoo-command";
import { createClient } from "../lib/client-factory";
import { jsonOption } from "../lib/common-options";
import { outputResult } from "@repo/cli-utils";
import type { Account } from "@repo/cacoo-api";

const whoami = new CacooCommand("whoami")
  .summary("Show the authenticated user")
  .description("Display information about the currently authenticated account.")
  .addOption(jsonOption())
  .examples([
    { description: "Show account info", command: "cacoo whoami" },
    { description: "Show as JSON", command: "cacoo whoami --json" },
  ])
  .action(async (options: { json?: string }) => {
    const client = createClient();
    const acct = await client.getAccount();

    outputResult(acct, options.json, (a: Account) => {
      console.log(`Name:     ${a.name}`);
      console.log(`Nickname: ${a.nickname}`);
      console.log(`Type:     ${a.type}`);
    });
  });

export default whoami;
