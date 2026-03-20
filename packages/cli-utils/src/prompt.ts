import consola from "consola";
import { UserError } from "./error";

export async function promptRequired(
  label: string,
  existing?: string,
): Promise<string> {
  if (existing) return existing;

  if (!process.stdin.isTTY) {
    throw new UserError(`${label} is required. Use the appropriate flag or set the environment variable.`);
  }

  const value = await consola.prompt(label, { type: "text" });
  if (typeof value === "symbol" || !value) {
    throw new UserError(`${label} is required.`);
  }
  return value;
}

export async function confirmOrExit(
  message: string,
  skipConfirm?: boolean,
): Promise<void> {
  if (skipConfirm) return;

  if (!process.stdin.isTTY) {
    throw new UserError("Confirmation required. Use --yes to skip.");
  }

  const confirmed = await consola.prompt(message, { type: "confirm" });
  if (!confirmed) {
    throw new UserError("Operation cancelled.");
  }
}
