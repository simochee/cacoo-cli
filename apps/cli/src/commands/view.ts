import { CacooCommand } from "../lib/cacoo-command";
import { createClient } from "../lib/client-factory";
import { jsonOption, orgOption } from "../lib/common-options";
import { outputResult } from "@repo/cli-utils";
import type { Diagram } from "@repo/cacoo-api";

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
    const client = createClient();
    const diagram = await client.getDiagram(diagramId);

    outputResult(diagram, options.json, (d: Diagram) => {
      console.log(`Title:       ${d.title}`);
      console.log(`ID:          ${d.diagramId}`);
      console.log(`Owner:       ${d.ownerNickname ?? d.ownerName}`);
      console.log(`Security:    ${d.security}`);
      console.log(`Sheets:      ${d.sheetCount}`);
      console.log(`Folder:      ${d.folderName}`);
      console.log(`URL:         ${d.url}`);
      console.log(`Created:     ${d.created}`);
      console.log(`Updated:     ${d.updated}`);
      if (d.description) {
        console.log(`Description: ${d.description}`);
      }
    });
  });

export default view;
