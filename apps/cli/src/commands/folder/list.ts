import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { offsetOption, limitOption, jsonOption } from "../../lib/common-options";
import { outputResult, printTable } from "@cacoo/cli-utils";
import type { Folder } from "@cacoo/api";

const list = new CacooCommand("list")
  .summary("List folders")
  .description("List folders accessible to the authenticated user.")
  .addOption(offsetOption())
  .addOption(limitOption())
  .option("--type <type>", "Filter by folder type")
  .addOption(jsonOption())
  .examples([{ description: "List all folders", command: "cacoo folder list" }])
  .action(async (options: { offset?: number; limit?: number; type?: string; json?: string }) => {
    const client = createClient();
    const result = await client.listFolders({
      offset: options.offset,
      limit: options.limit,
      type: options.type,
    });

    outputResult(result.result, options.json, (folders: Folder[]) => {
      if (folders.length === 0) {
        console.log("No folders found.");
        return;
      }
      printTable(
        ["ID", "NAME", "TYPE", "DIAGRAMS", "UPDATED"],
        folders.map((f) => [
          String(f.folderId),
          f.folderName,
          f.type,
          String(f.diagramCount),
          f.updated,
        ]),
      );
    });
  });

export default list;
