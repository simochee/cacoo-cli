import { CacooCommand } from "../../lib/cacoo-command";

const auth = new CacooCommand("auth").description("Authenticate with the Cacoo API");

await auth.addCommands([import("./login"), import("./logout"), import("./status")]);

export default auth;
