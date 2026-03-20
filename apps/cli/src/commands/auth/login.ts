import { CacooCommand } from "../../lib/cacoo-command";
import { saveConfig } from "@cacoo/config";
import { CacooClient } from "@cacoo/api";

const login = new CacooCommand("login")
  .summary("Authenticate with a Cacoo API key")
  .description(
    "Store a Cacoo API key for use with subsequent commands.\n" +
      "You can find your API key at https://cacoo.com/profile/api",
  )
  .option("--with-token", "Read API key from standard input")
  .envVars([["CACOO_API_KEY", "Authenticate with an API key"]])
  .examples([
    {
      description: "Login interactively",
      command: "cacoo auth login",
    },
    {
      description: "Login with API key from stdin",
      command: "echo 'your-api-key' | cacoo auth login --with-token",
    },
  ])
  .action(async (options: { withToken?: boolean }) => {
    let apiKey: string;

    if (options.withToken) {
      apiKey = (await readStdin()).trim();
    } else {
      process.stdout.write("Enter your Cacoo API key: ");
      apiKey = (await readStdin()).trim();
    }

    if (!apiKey) {
      console.error("Error: No API key provided.");
      process.exit(1);
    }

    // Verify the key works
    const client = new CacooClient({ apiKey });
    try {
      const account = await client.getAccount();
      saveConfig({ apiKey });
      console.log(`Logged in as ${account.nickname ?? account.name}`);
    } catch {
      console.error("Error: Invalid API key or network error.");
      process.exit(1);
    }
  });

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default login;
