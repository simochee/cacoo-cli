import { CacooCommand } from "../../lib/cacoo-command";

const diagram = new CacooCommand("diagram").description("Manage Cacoo diagrams");

await diagram.addCommands([
  import("./list"),
  import("./view"),
  import("./delete"),
  import("./copy"),
  import("./contents"),
]);

export default diagram;
