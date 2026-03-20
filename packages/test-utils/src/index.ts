import type { CacooClientOptions } from "@repo/cacoo-api";

export function createMockClient(): {
  options: CacooClientOptions;
  fetch: ReturnType<typeof createMockFetch>;
} {
  return {
    options: { apiKey: "test-api-key", baseUrl: "https://mock.cacoo.com/api/v1" },
    fetch: createMockFetch(),
  };
}

export function createMockFetch() {
  const responses: Map<string, { status: number; body: unknown }> = new Map();

  const mockFetch = (input: string | Request | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    for (const [pattern, resp] of responses) {
      if (url.includes(pattern)) {
        return Promise.resolve(
          new Response(JSON.stringify(resp.body), {
            status: resp.status,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
    }
    return Promise.resolve(new Response("Not Found", { status: 404 }));
  };

  mockFetch.on = (pattern: string, status: number, body: unknown) => {
    responses.set(pattern, { status, body });
    return mockFetch;
  };

  mockFetch.clear = () => {
    responses.clear();
  };

  return mockFetch;
}

export function captureOutput(): {
  stdout: string[];
  stderr: string[];
  restore: () => void;
} {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const origLog = console.log;
  const origError = console.error;

  console.log = (...args: unknown[]) => {
    stdout.push(args.map(String).join(" "));
  };
  console.error = (...args: unknown[]) => {
    stderr.push(args.map(String).join(" "));
  };

  return {
    stdout,
    stderr,
    restore: () => {
      console.log = origLog;
      console.error = origError;
    },
  };
}
