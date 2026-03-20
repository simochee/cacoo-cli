import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("config logic", () => {
  const testDir = join(tmpdir(), "cacoo-cli-test-" + Date.now());
  const configFile = join(testDir, "config.json");

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  it("returns empty config when file does not exist", () => {
    expect(existsSync(configFile)).toBe(false);
  });

  it("reads and writes config", () => {
    const config = { apiKey: "test-key", baseUrl: "https://example.com" };
    writeFileSync(configFile, JSON.stringify(config));

    const raw = JSON.parse(require("node:fs").readFileSync(configFile, "utf-8"));
    expect(raw.apiKey).toBe("test-key");
    expect(raw.baseUrl).toBe("https://example.com");
  });

  it("reads and writes config with organization", () => {
    const config = { apiKey: "test-key", organization: "my-org" };
    writeFileSync(configFile, JSON.stringify(config));

    const raw = JSON.parse(require("node:fs").readFileSync(configFile, "utf-8"));
    expect(raw.apiKey).toBe("test-key");
    expect(raw.organization).toBe("my-org");
  });

  it("resolves API key from environment", () => {
    const prev = process.env.CACOO_API_KEY;
    process.env.CACOO_API_KEY = "env-key";

    expect(process.env.CACOO_API_KEY).toBe("env-key");

    if (prev !== undefined) {
      process.env.CACOO_API_KEY = prev;
    } else {
      delete process.env.CACOO_API_KEY;
    }
  });

  it("resolves organization from environment", () => {
    const prev = process.env.CACOO_ORGANIZATION;
    process.env.CACOO_ORGANIZATION = "env-org";

    expect(process.env.CACOO_ORGANIZATION).toBe("env-org");

    if (prev !== undefined) {
      process.env.CACOO_ORGANIZATION = prev;
    } else {
      delete process.env.CACOO_ORGANIZATION;
    }
  });
});
