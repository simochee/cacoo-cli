import { CacooCommand } from "../../lib/cacoo-command";
import { resolveAuth } from "@repo/config";

const token = new CacooCommand("token")
  .summary("Print the auth token")
  .description("Print the current authentication token (API key or OAuth access token) to stdout.")
  .examples([
    { description: "Print token", command: "cacoo auth token" },
    { description: "Use token in a script", command: "curl -H \"Authorization: Bearer $(cacoo auth token)\" ..." },
  ])
  .action(() => {
    const auth = resolveAuth();
    if (!auth) {
      console.error("Not authenticated. Run `cacoo auth login`.");
      process.exit(1);
    }

    const value = auth.method === "api-key" ? auth.apiKey : auth.accessToken;
    process.stdout.write(value);
  });

export default token;
