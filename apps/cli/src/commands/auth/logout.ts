import { CacooCommand } from "../../lib/cacoo-command";
import { updateConfig } from "@repo/config";

const logout = new CacooCommand("logout")
  .summary("Remove stored authentication")
  .description("Remove stored credentials from the local configuration.")
  .action(() => {
    updateConfig((config) => {
      const { auth: _, ...rest } = config;
      return rest;
    });
    console.log("Logged out.");
  });

export default logout;
