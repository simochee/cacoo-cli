import { randomBytes } from "node:crypto";
import { CacooCommand } from "../../lib/cacoo-command";
import { updateAuth } from "@repo/config";
import {
  CacooClient,
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
  startCallbackServer,
} from "@repo/cacoo-api";
import { UserError } from "@repo/cli-utils";
import consola from "consola";

const DEFAULT_OAUTH_PORT = 5033;

const login = new CacooCommand("login")
  .summary("Authenticate with Cacoo")
  .description(
    "Authenticate with the Cacoo API using an API key or OAuth.\n" +
      "You can find your API key at https://cacoo.com/profile/api",
  )
  .option("--method <method>", "Authentication method (api-key, oauth)", "api-key")
  .option("--with-token", "Read API key from standard input")
  .envVars([
    ["CACOO_API_KEY", "Authenticate with an API key"],
    ["CACOO_OAUTH_CLIENT_ID", "OAuth client ID"],
    ["CACOO_OAUTH_CLIENT_SECRET", "OAuth client secret"],
    ["CACOO_OAUTH_PORT", "OAuth callback server port (default: 5033)"],
  ])
  .examples([
    {
      description: "Login with API key (interactive)",
      command: "cacoo auth login",
    },
    {
      description: "Login with API key from stdin",
      command: "echo 'your-api-key' | cacoo auth login --with-token",
    },
    {
      description: "Login with OAuth",
      command: "cacoo auth login --method oauth",
    },
  ])
  .action(async (options: { method: string; withToken?: boolean }) => {
    if (options.method === "oauth") {
      await loginWithOAuth();
    } else {
      await loginWithApiKey(options.withToken);
    }
  });

async function loginWithApiKey(withToken?: boolean): Promise<void> {
  let apiKey: string;

  if (withToken) {
    apiKey = (await readStdin()).trim();
  } else {
    process.stdout.write("Enter your Cacoo API key: ");
    apiKey = (await readStdin()).trim();
  }

  if (!apiKey) {
    throw new UserError("No API key provided.");
  }

  const client = new CacooClient({ apiKey });
  try {
    const account = await client.getAccount();
    updateAuth({ method: "api-key", apiKey });
    consola.info(`Logged in as ${account.nickname ?? account.name}`);
  } catch {
    throw new UserError("Invalid API key or network error.");
  }
}

async function loginWithOAuth(): Promise<void> {
  const clientId = process.env.CACOO_OAUTH_CLIENT_ID;
  const clientSecret = process.env.CACOO_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new UserError(
      "CACOO_OAUTH_CLIENT_ID and CACOO_OAUTH_CLIENT_SECRET must be set.\n" +
        "Register an OAuth client in your Nulab Account settings.",
    );
  }

  const port = Number(process.env.CACOO_OAUTH_PORT) || DEFAULT_OAUTH_PORT;
  const redirectUri = `http://localhost:${port}/callback`;
  const state = randomBytes(16).toString("hex");

  const server = startCallbackServer(port);

  const authUrl = buildAuthorizationUrl({ clientId, redirectUri, state });
  consola.info(`Opening browser for authentication...\n\n  ${authUrl}\n`);

  // Try to open the browser
  const { execFile } = await import("node:child_process");
  const platform = process.platform;
  if (platform === "darwin") {
    execFile("open", [authUrl]);
  } else if (platform === "win32") {
    execFile("cmd", ["/c", "start", "", authUrl]);
  } else {
    execFile("xdg-open", [authUrl]);
  }

  try {
    const code = await server.waitForCallback(state);

    const tokens = await exchangeAuthorizationCode({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });

    const client = new CacooClient({ accessToken: tokens.access_token });
    const account = await client.getAccount();

    updateAuth({
      method: "oauth",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      clientId,
      clientSecret,
    });

    consola.info(`Logged in as ${account.nickname ?? account.name} (OAuth)`);
  } catch (error) {
    throw new UserError(error instanceof Error ? error.message : String(error));
  } finally {
    server.stop();
  }
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default login;
