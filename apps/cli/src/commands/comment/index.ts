import { CacooCommand } from "../../lib/cacoo-command";

const comment = new CacooCommand("comment").description("Manage diagram comments");

await comment.addCommands([import("./list"), import("./add")]);

export default comment;
