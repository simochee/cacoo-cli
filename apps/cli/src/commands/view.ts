import { CacooCommand } from "../lib/cacoo-command";
import { createClient, resolveOrg } from "../lib/client-factory";
import { jsonOption, orgOption } from "../lib/common-options";
import { outputResult } from "@repo/cli-utils";
import type { Diagram } from "@repo/cacoo-api";
import consola from "consola";

const view = new CacooCommand("view")
  .summary("View a diagram")
  .description("Display detailed information about a specific diagram.")
  .argument("<diagram-id>", "The diagram ID")
  .addOption(jsonOption())
  .addOption(orgOption())
  .examples([
    { description: "View diagram details", command: "cacoo view abc123" },
    {
      description: "View as JSON with specific fields",
      command: "cacoo view abc123 --json title,url",
    },
  ])
  .action(async (diagramId: string, options: { json?: string; org?: string }) => {
    const org = resolveOrg(options.org);
    const client = createClient();
    const diagram = await client.getDiagram(diagramId);

    outputResult(diagram, options.json, (d: Diagram) => {
      consola.log(`Title:       ${d.title}`);
      consola.log(`ID:          ${d.diagramId}`);
      consola.log(`Owner:       ${d.ownerNickname ?? d.ownerName}`);
      consola.log(`Security:    ${d.security}`);
      consola.log(`Sheets:      ${d.sheetCount}`);
      consola.log(`Folder:      ${d.folderName}`);
      consola.log(`URL:         ${d.url}`);
      consola.log(`Created:     ${d.created}`);
      consola.log(`Updated:     ${d.updated}`);
      if (d.description) {
        consola.log(`Description: ${d.description}`);
      }
    });
  });

export default view;
