import { CacooCommand } from "../lib/cacoo-command";
import { createClient, resolveOrg } from "../lib/client-factory";
import { orgOption } from "../lib/common-options";
import consola from "consola";

const open = new CacooCommand("open")
  .summary("Open a diagram in the browser")
  .description("Open a diagram in the default web browser.")
  .argument("<diagram-id>", "The diagram ID")
  .addOption(orgOption())
  .examples([{ description: "Open diagram in browser", command: "cacoo open abc123" }])
  .action(async (diagramId: string, options: { org?: string }) => {
    const org = resolveOrg(options.org);
    const client = createClient();
    const diagram = await client.getDiagram(diagramId);
    const url = diagram.url;

    const { execFileSync } = await import("node:child_process");
    const platform = process.platform;

    if (platform === "darwin") {
      execFileSync("open", [url]);
    } else if (platform === "win32") {
      execFileSync("cmd", ["/c", "start", "", url]);
    } else {
      execFileSync("xdg-open", [url]);
    }

    consola.info(`Opened ${url}`);
  });

export default open;
