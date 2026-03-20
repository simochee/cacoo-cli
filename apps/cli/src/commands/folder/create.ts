import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { jsonOption } from "../../lib/common-options";
import { outputResult } from "@cacoo/cli-utils";
import type { Folder } from "@cacoo/api";

const create = new CacooCommand("create")
  .summary("Create a folder")
  .description("Create a new folder for organizing diagrams.")
  .argument("<name>", "The folder name")
  .addOption(jsonOption())
  .examples([
    {
      description: "Create a folder",
      command: 'cacoo folder create "My Project"',
    },
  ])
  .action(async (name: string, options: { json?: string }) => {
    const client = createClient();
    const folder = await client.createFolder(name);

    outputResult(folder, options.json, (f: Folder) => {
      console.log(`Created folder: ${f.folderName}`);
      console.log(`ID: ${f.folderId}`);
    });
  });

export default create;
