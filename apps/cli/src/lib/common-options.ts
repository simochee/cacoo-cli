import { Option } from "commander";

export function offsetOption(): Option {
  return new Option("--offset <number>", "Number of items to skip").argParser(Number);
}

export function limitOption(): Option {
  return new Option("--limit <number>", "Maximum number of items to return").argParser(Number);
}

export function jsonOption(): Option {
  return new Option(
    "--json [fields]",
    "Output as JSON (optionally filter by comma-separated field names)",
  );
}

export function sortOption(): Option {
  return new Option("--sort <field>", "Sort field");
}
