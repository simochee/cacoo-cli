import { CacooCommand } from "./lib/cacoo-command";
import { handleError } from "./lib/error";

const program = new CacooCommand("cacoo")
  .version("0.1.0")
  .description("Cacoo CLI - manage diagrams from the command line");

program.envVars([["CACOO_API_KEY", "Authenticate with an API key"]]);

await program.addCommands([
  import("./commands/auth/index"),
  import("./commands/diagram/index"),
  import("./commands/folder/index"),
  import("./commands/comment/index"),
  import("./commands/account/index"),
  import("./commands/org/index"),
]);

program.exitOverride();

try {
  await program.parseAsync();
} catch (error) {
  handleError(error);
}
