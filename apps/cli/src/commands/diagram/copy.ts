import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { jsonOption } from "../../lib/common-options";
import { outputResult } from "@cacoo/cli-utils";
import type { Diagram } from "@cacoo/api";

const copy = new CacooCommand("copy")
  .summary("Copy a diagram")
  .description("Create a copy of an existing diagram.")
  .argument("<diagram-id>", "The diagram ID to copy")
  .addOption(jsonOption())
  .examples([
    {
      description: "Copy a diagram",
      command: "cacoo diagram copy abc123",
    },
  ])
  .action(async (diagramId: string, options: { json?: string }) => {
    const client = createClient();
    const diagram = await client.copyDiagram(diagramId);

    outputResult(diagram, options.json, (d: Diagram) => {
      console.log(`Copied diagram: ${d.title}`);
      console.log(`New ID: ${d.diagramId}`);
      console.log(`URL: ${d.url}`);
    });
  });

export default copy;
