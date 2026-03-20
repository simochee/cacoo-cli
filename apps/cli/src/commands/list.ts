import { CacooCommand } from "../lib/cacoo-command";
import { createClient } from "../lib/client-factory";
import {
  offsetOption,
  limitOption,
  jsonOption,
  sortOption,
  orgOption,
} from "../lib/common-options";
import { outputResult, printTable } from "@cacoo/cli-utils";
import type { Diagram } from "@cacoo/api";

const list = new CacooCommand("list")
  .summary("List diagrams")
  .description("List diagrams accessible to the authenticated user.")
  .addOption(offsetOption())
  .addOption(limitOption())
  .addOption(sortOption())
  .addOption(orgOption())
  .option("--folder-id <id>", "Filter by folder ID", Number)
  .option("--type <type>", "Filter by diagram type")
  .addOption(jsonOption())
  .examples([
    { description: "List all diagrams", command: "cacoo list" },
    { description: "List diagrams as JSON", command: "cacoo list --json" },
    { description: "List diagrams in a folder", command: "cacoo list --folder-id 123" },
    { description: "List diagrams for an org", command: "cacoo list --org my-org" },
  ])
  .action(
    async (options: {
      offset?: number;
      limit?: number;
      sort?: string;
      folderId?: number;
      type?: string;
      json?: string;
      org?: string;
    }) => {
      const client = createClient();
      const result = await client.listDiagrams({
        offset: options.offset,
        limit: options.limit,
        sort: options.sort,
        folderId: options.folderId,
        type: options.type,
      });

      outputResult(result.result, options.json, (diagrams: Diagram[]) => {
        if (diagrams.length === 0) {
          console.log("No diagrams found.");
          return;
        }
        printTable(
          ["ID", "TITLE", "OWNER", "SHEETS", "UPDATED"],
          diagrams.map((d) => [
            d.diagramId,
            d.title,
            d.ownerNickname ?? d.ownerName,
            String(d.sheetCount),
            d.updated,
          ]),
        );
      });
    },
  );

export default list;
