import { CacooCommand } from "./lib/cacoo-command";
import { handleError } from "./lib/error";

const program = new CacooCommand("cacoo")
  .version("0.1.0")
  .description("Cacoo CLI - manage diagrams from the command line");

program.envVars([
  ["CACOO_API_KEY", "Authenticate with an API key"],
  ["CACOO_ORGANIZATION", "Set the default organization"],
]);

await program.addCommands([
  // Core diagram operations (top-level)
  import("./commands/list"),
  import("./commands/view"),
  import("./commands/open"),
  import("./commands/copy"),
  import("./commands/delete"),
  // Identity
  import("./commands/whoami"),
  import("./commands/auth/index"),
  // Collaboration
  import("./commands/comment/index"),
  // Organization
  import("./commands/folder/index"),
  import("./commands/org/index"),
  // Advanced
  import("./commands/api"),
]);

program.exitOverride();

try {
  await program.parseAsync();
} catch (error) {
  handleError(error);
}
