import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { jsonOption } from "../../lib/common-options";
import { outputResult, printTable } from "@repo/cli-utils";
import type { Organization } from "@repo/cacoo-api";

const list = new CacooCommand("list")
  .summary("List organizations")
  .description("List all organizations the authenticated user belongs to.")
  .addOption(jsonOption())
  .examples([{ description: "List organizations", command: "cacoo org list" }])
  .action(async (options: { json?: string }) => {
    const client = createClient();
    const result = await client.listOrganizations();

    outputResult(result.result, options.json, (orgs: Organization[]) => {
      if (orgs.length === 0) {
        console.log("No organizations found.");
        return;
      }
      printTable(
        ["KEY", "NAME", "PLAN"],
        orgs.map((o) => [o.key, o.name, o.plan]),
      );
    });
  });

export default list;
