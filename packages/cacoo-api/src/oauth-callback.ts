import { createServer, type Server } from "node:http";

const DEFAULT_PORT = 5033;
const TIMEOUT_MS = 5 * 60 * 1000;

const SUCCESS_HTML = `<!DOCTYPE html>
<html><head><title>Authentication Successful</title></head>
<body style="font-family:sans-serif;text-align:center;padding:40px">
<h1>Authentication successful!</h1>
<p>You can close this window and return to the terminal.</p>
</body></html>`;

const ERROR_HTML = (msg: string) => `<!DOCTYPE html>
<html><head><title>Authentication Failed</title></head>
<body style="font-family:sans-serif;text-align:center;padding:40px">
<h1>Authentication failed</h1>
<p>${msg}</p>
</body></html>`;

export interface CallbackServer {
  port: number;
  waitForCallback(expectedState: string): Promise<string>;
  stop(): void;
}

export function startCallbackServer(port = DEFAULT_PORT): CallbackServer {
  let resolveCode: ((code: string) => void) | undefined;
  let rejectCode: ((err: Error) => void) | undefined;
  let server: Server;

  const codePromise = new Promise<string>((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });

  server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    if (url.pathname !== "/callback") {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(ERROR_HTML(error));
      rejectCode?.(new Error(`OAuth error: ${error}`));
      return;
    }

    if (!code || !state) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(ERROR_HTML("Missing code or state parameter"));
      rejectCode?.(new Error("Missing code or state parameter"));
      return;
    }

    // State validation is done in waitForCallback
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(SUCCESS_HTML);

    resolveCode?.(`${state}:${code}`);
  });

  server.listen(port);

  return {
    port,
    async waitForCallback(expectedState: string): Promise<string> {
      const timeout = setTimeout(() => {
        rejectCode?.(new Error("OAuth callback timed out"));
      }, TIMEOUT_MS);

      try {
        const result = await codePromise;
        const [state, ...codeParts] = result.split(":");
        const code = codeParts.join(":");

        if (state !== expectedState) {
          throw new Error("OAuth state mismatch (possible CSRF attack)");
        }

        return code;
      } finally {
        clearTimeout(timeout);
      }
    },
    stop() {
      server.close();
    },
  };
}
