import { CacooCommand } from "../../lib/cacoo-command";
import { createClient, resolveOrg } from "../../lib/client-factory";
import { jsonOption, orgOption } from "../../lib/common-options";
import { outputResult } from "@repo/cli-utils";
import type { Folder } from "@repo/cacoo-api";
import consola from "consola";

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
    const org = resolveOrg(options.org);
    const client = createClient();
    const folder = await client.createFolder(name);

    outputResult(folder, options.json, (f: Folder) => {
      consola.info(`Created folder: ${f.folderName}`);
      consola.log(`ID: ${f.folderId}`);
    });
  });

export default create;
