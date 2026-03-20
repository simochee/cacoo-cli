import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";

const contents = new CacooCommand("contents")
  .summary("Get diagram contents")
  .description("Retrieve the XML contents of a diagram.")
  .argument("<diagram-id>", "The diagram ID")
  .examples([
    {
      description: "Get diagram XML contents",
      command: "cacoo diagram contents abc123",
    },
  ])
  .action(async (diagramId: string) => {
    const client = createClient();
    const xml = await client.getDiagramContents(diagramId);
    process.stdout.write(xml);
  });

export default contents;
