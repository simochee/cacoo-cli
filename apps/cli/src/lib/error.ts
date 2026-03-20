import { CommanderError } from "commander";
import { CacooApiError } from "@repo/cacoo-api";
import { UserError } from "@repo/cli-utils";

export function handleError(error: unknown): never {
  if (error instanceof CommanderError) {
    process.exit(error.exitCode);
  }

  if (error instanceof UserError) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  if (error instanceof CacooApiError) {
    console.error(`API Error: ${error.status} ${error.statusText}`);
    if (error.body) {
      console.error(error.body);
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  console.error("An unknown error occurred");
  process.exit(1);
}
