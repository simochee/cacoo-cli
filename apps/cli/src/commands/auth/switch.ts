import { CacooCommand } from "../../lib/cacoo-command";
import { updateConfig } from "@cacoo/config";
import { createClient } from "../../lib/client-factory";

const switchCmd = new CacooCommand("switch")
  .summary("Switch the active organization")
  .description(
    "Set the default organization for subsequent commands.\n" +
      "Use `cacoo org list` to see available organizations.",
  )
  .argument("<org-key>", "The organization key to switch to")
  .examples([
    { description: "Switch to an organization", command: "cacoo auth switch my-org" },
    { description: "Show current organization", command: "cacoo auth status" },
  ])
  .action(async (orgKey: string) => {
    const client = createClient();
    const org = await client.getOrganization(orgKey);

    updateConfig({ organization: orgKey });
    console.log(`Switched to organization: ${org.name} (${org.key})`);
  });

export default switchCmd;
