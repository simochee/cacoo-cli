import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { jsonOption } from "../../lib/common-options";
import { outputResult } from "@repo/cli-utils";
import type { Organization } from "@repo/cacoo-api";
import consola from "consola";

const view = new CacooCommand("view")
  .summary("View organization details")
  .description("Display detailed information about an organization.")
  .argument("<org-key>", "The organization key")
  .addOption(jsonOption())
  .examples([
    {
      description: "View organization",
      command: "cacoo org view my-org",
    },
  ])
  .action(async (orgKey: string, options: { json?: string }) => {
    const client = createClient();
    const org = await client.getOrganization(orgKey);

    outputResult(org, options.json, (o: Organization) => {
      consola.log(`Name:        ${o.name}`);
      consola.log(`Key:         ${o.key}`);
      consola.log(`Plan:        ${o.plan}`);
      consola.log(`URL:         ${o.url}`);
      if (o.description) {
        consola.log(`Description: ${o.description}`);
      }
    });
  });

export default view;
