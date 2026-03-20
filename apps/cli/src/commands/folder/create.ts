import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { jsonOption, orgOption } from "../../lib/common-options";
import { outputResult } from "@repo/cli-utils";
import type { Folder } from "@repo/cacoo-api";

const create = new CacooCommand("create")
  .summary("Create a folder")
  .description("Create a new folder for organizing diagrams.")
  .argument("<name>", "The folder name")
  .addOption(jsonOption())
  .addOption(orgOption())
  .examples([
    {
      description: "Create a folder",
      command: 'cacoo folder create "My Project"',
    },
  ])
  .action(async (name: string, options: { json?: string; org?: string }) => {
    const client = createClient();
    const folder = await client.createFolder(name);

    outputResult(folder, options.json, (f: Folder) => {
      console.log(`Created folder: ${f.folderName}`);
      console.log(`ID: ${f.folderId}`);
    });
  });

export default create;
