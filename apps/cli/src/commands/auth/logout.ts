import { CacooCommand } from "../../lib/cacoo-command";
import { loadConfig, saveConfig } from "@cacoo/config";

const logout = new CacooCommand("logout")
  .summary("Remove stored authentication")
  .description("Remove stored credentials from the local configuration.")
  .action(() => {
    const config = loadConfig();
    const { auth: _, ...rest } = config;
    saveConfig(rest);
    console.log("Logged out.");
  });

export default logout;
