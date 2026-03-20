import { describe, it, expect } from "bun:test";
import { UserError } from "./error";
import { promptRequired } from "./prompt";

describe("promptRequired", () => {
  it("returns existing value when provided", async () => {
    const result = await promptRequired("Label", "existing-value");
    expect(result).toBe("existing-value");
  });

  it("throws UserError in non-TTY", async () => {
    expect(promptRequired("Label")).rejects.toBeInstanceOf(UserError);
  });
});
