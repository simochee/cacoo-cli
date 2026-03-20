import { CacooCommand } from "../../lib/cacoo-command";

const folder = new CacooCommand("folder").description("Manage Cacoo folders");

await folder.addCommands([import("./list"), import("./create")]);

export default folder;
