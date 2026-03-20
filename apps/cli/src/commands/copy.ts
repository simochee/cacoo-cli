import { CacooCommand } from "../lib/cacoo-command";
import { createClient } from "../lib/client-factory";
import { jsonOption, orgOption } from "../lib/common-options";
import { outputResult } from "@repo/cli-utils";
import type { Diagram } from "@repo/cacoo-api";

const copy = new CacooCommand("copy")
  .summary("Copy a diagram")
  .description("Create a copy of an existing diagram.")
  .argument("<diagram-id>", "The diagram ID to copy")
  .addOption(jsonOption())
  .addOption(orgOption())
  .examples([{ description: "Copy a diagram", command: "cacoo copy abc123" }])
  .action(async (diagramId: string, options: { json?: string; org?: string }) => {
    const client = createClient();
    const diagram = await client.copyDiagram(diagramId);

    outputResult(diagram, options.json, (d: Diagram) => {
      console.log(`Copied diagram: ${d.title}`);
      console.log(`New ID: ${d.diagramId}`);
      console.log(`URL: ${d.url}`);
    });
  });

export default copy;
