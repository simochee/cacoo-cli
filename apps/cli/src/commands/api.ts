import { CacooCommand } from "../lib/cacoo-command";
import { createClient } from "../lib/client-factory";
import { UserError } from "@cacoo/cli-utils";

const VALID_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);

const api = new CacooCommand("api")
  .summary("Make an authenticated API request")
  .description(
    "Make a raw API request to the Cacoo API.\n" +
      "The path is relative to /api/v1. Authentication is handled automatically.",
  )
  .argument("<method>", "HTTP method (GET, POST, PUT, DELETE)")
  .argument("<path>", "API path (e.g. /diagrams.json)")
  .option("--body <json>", "Request body as key=value pairs (for POST/PUT)")
  .examples([
    { description: "Get diagrams", command: "cacoo api GET /diagrams.json" },
    { description: "Get a specific diagram", command: "cacoo api GET /diagrams/abc123.json" },
    { description: "Delete a diagram", command: "cacoo api DELETE /diagrams/abc123.json" },
  ])
  .action(async (method: string, path: string, options: { body?: string }) => {
    const upperMethod = method.toUpperCase();
    if (!VALID_METHODS.has(upperMethod)) {
      throw new UserError(`Invalid HTTP method: ${method}. Use GET, POST, PUT, DELETE, or PATCH.`);
    }

    let bodyParams: Record<string, string> | undefined;
    if (options.body) {
      bodyParams = {};
      for (const pair of options.body.split("&")) {
        const [key, ...rest] = pair.split("=");
        if (key) {
          bodyParams[key] = rest.join("=");
        }
      }
    }

    const client = createClient();
    const result = await client.rawRequest(upperMethod, path, bodyParams);
    const json = JSON.stringify(result.body, null, 2);
    process.stdout.write(json + "\n");
  });

export default api;
