import { CacooCommand } from "../lib/cacoo-command";
import { createClient, resolveOrg } from "../lib/client-factory";
import { orgOption } from "../lib/common-options";
import { confirmOrExit } from "@repo/cli-utils";
import consola from "consola";

const del = new CacooCommand("delete")
  .summary("Delete a diagram")
  .description("Permanently delete a diagram. This action cannot be undone.")
  .argument("<diagram-id>", "The diagram ID to delete")
  .option("-y, --yes", "Skip confirmation prompt")
  .addOption(orgOption())
  .examples([
    { description: "Delete a diagram", command: "cacoo delete abc123" },
    { description: "Delete without confirmation", command: "cacoo delete abc123 --yes" },
  ])
  .action(async (diagramId: string, options: { yes?: boolean; org?: string }) => {
    const org = resolveOrg(options.org);
    const client = createClient();
    const diagram = await client.getDiagram(diagramId);

    await confirmOrExit(`Delete diagram "${diagram.title}" (${diagramId})?`, options.yes);

    await client.deleteDiagram(diagramId);
    consola.info(`Deleted diagram ${diagramId}.`);
  });

export default del;
