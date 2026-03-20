import { CacooCommand } from "../../lib/cacoo-command";
import { saveConfig } from "@cacoo/config";

const logout = new CacooCommand("logout")
  .summary("Remove stored authentication")
  .description("Remove the stored API key from the local configuration.")
  .action(() => {
    saveConfig({});
    console.log("Logged out.");
  });

export default logout;
