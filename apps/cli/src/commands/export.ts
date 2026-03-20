import { CacooCommand } from "../lib/cacoo-command";
import { createClient } from "../lib/client-factory";
import { orgOption } from "../lib/common-options";

const exportCmd = new CacooCommand("export")
  .summary("Export diagram contents")
  .description("Export the contents of a diagram. Defaults to XML format.")
  .argument("<diagram-id>", "The diagram ID")
  .option("--format <format>", "Export format (xml)", "xml")
  .addOption(orgOption())
  .examples([
    { description: "Export diagram as XML", command: "cacoo export abc123" },
    { description: "Export and save to file", command: "cacoo export abc123 > diagram.xml" },
  ])
  .action(async (diagramId: string, options: { format: string; org?: string }) => {
    const client = createClient();

    if (options.format === "xml") {
      const xml = await client.getDiagramContents(diagramId);
      process.stdout.write(xml);
    } else {
      console.error(`Unsupported format: ${options.format}`);
      process.exit(1);
    }
  });

export default exportCmd;
