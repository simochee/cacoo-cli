import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { parseConfig, resolveOrganization } from "./index";

describe("config schema", () => {
  it("validates api-key auth", () => {
    const result = parseConfig({
      auth: { method: "api-key", apiKey: "test-key" },
    });
    expect(result.auth?.method).toBe("api-key");
  });

  it("validates oauth auth", () => {
    const result = parseConfig({
      auth: {
        method: "oauth",
        accessToken: "at",
        refreshToken: "rt",
        clientId: "cid",
        clientSecret: "cs",
      },
    });
    expect(result.auth?.method).toBe("oauth");
  });

  it("rejects invalid auth method", () => {
    expect(() => parseConfig({ auth: { method: "invalid" } })).toThrow();
  });

  it("accepts empty config", () => {
    const result = parseConfig({});
    expect(result.auth).toBeUndefined();
    expect(result.defaultOrganization).toBeUndefined();
  });

  it("validates defaultOrganization", () => {
    const result = parseConfig({ defaultOrganization: "my-org" });
    expect(result.defaultOrganization).toBe("my-org");
  });
});

describe("resolveOrganization", () => {
  const originalEnv = process.env.CACOO_ORGANIZATION;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CACOO_ORGANIZATION = originalEnv;
    } else {
      delete process.env.CACOO_ORGANIZATION;
    }
  });

  it("returns override when provided", () => {
    expect(resolveOrganization("override-org")).toBe("override-org");
  });

  it("returns env var when no override", () => {
    process.env.CACOO_ORGANIZATION = "env-org";
    expect(resolveOrganization()).toBe("env-org");
  });
});
