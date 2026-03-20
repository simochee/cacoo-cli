import { CacooCommand } from "../../lib/cacoo-command";
import { updateConfig } from "@repo/config";
import consola from "consola";

const logout = new CacooCommand("logout")
  .summary("Remove stored authentication")
  .description("Remove stored credentials from the local configuration.")
  .action(() => {
    updateConfig((config) => {
      const { auth: _, ...rest } = config;
      return rest;
    });
    consola.info("Logged out.");
  });

export default logout;
