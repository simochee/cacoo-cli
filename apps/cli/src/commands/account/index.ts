import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { jsonOption } from "../../lib/common-options";
import { outputResult } from "@cacoo/cli-utils";
import type { Account } from "@cacoo/api";

const account = new CacooCommand("account")
  .summary("Show account information")
  .description("Display information about the authenticated account.")
  .addOption(jsonOption())
  .examples([
    { description: "Show account info", command: "cacoo account" },
    { description: "Show as JSON", command: "cacoo account --json" },
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

export default account;
