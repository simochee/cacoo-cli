import { CacooCommand } from "../lib/cacoo-command";
import { createClient } from "../lib/client-factory";
import { orgOption } from "../lib/common-options";

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
    if (!options.yes) {
      process.stdout.write(`Are you sure you want to delete diagram ${diagramId}? (y/N) `);
      const answer = await readLine();
      if (answer.toLowerCase() !== "y") {
        console.log("Cancelled.");
        return;
      }
    }

    const client = createClient();
    await client.deleteDiagram(diagramId);
    console.log(`Deleted diagram ${diagramId}.`);
  });

async function readLine(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
    if ((chunk as Buffer).includes(10)) break;
  }
  return Buffer.concat(chunks).toString("utf-8").trim();
}

export default del;
