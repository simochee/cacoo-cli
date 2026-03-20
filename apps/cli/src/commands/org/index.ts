import { CacooCommand } from "../../lib/cacoo-command";

const org = new CacooCommand("org").description("Manage organizations");

await org.addCommands([import("./list"), import("./view")]);

export default org;
