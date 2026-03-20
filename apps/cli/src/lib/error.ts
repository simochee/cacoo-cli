import consola from "consola";
import { CommanderError } from "commander";
import { CacooApiError } from "@repo/cacoo-api";
import { UserError } from "@repo/cli-utils";

export function handleError(error: unknown): never {
  if (error instanceof CommanderError) {
    process.exit(error.exitCode);
  }

  if (error instanceof UserError) {
    consola.error(`Error: ${error.message}`);
    process.exit(1);
  }

  if (error instanceof CacooApiError) {
    consola.error(`API Error: ${error.status} ${error.statusText}`);
    if (error.body) {
      consola.error(error.body);
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    consola.error(`Error: ${error.message}`);
    if (process.env.DEBUG) {
      consola.error(error.stack);
    }
    process.exit(1);
  }

  consola.error("An unknown error occurred");
  process.exit(1);
}
