import { describe, it, expect } from "bun:test";
import { CacooCommand } from "./cacoo-command";

describe("CacooCommand", () => {
  it("creates a command with name", () => {
    const cmd = new CacooCommand("test");
    expect(cmd.name()).toBe("test");
  });

  it("adds examples", () => {
    const cmd = new CacooCommand("test").examples([
      { description: "Run test", command: "cacoo test" },
    ]);
    expect(cmd.cacooExamples).toHaveLength(1);
    expect(cmd.cacooExamples[0].command).toBe("cacoo test");
  });

  it("adds environment variables", () => {
    const cmd = new CacooCommand("test").envVars([["MY_VAR", "Description"]]);
    expect(cmd.cacooEnvVars).toHaveLength(1);
    expect(cmd.cacooEnvVars[0][0]).toBe("MY_VAR");
  });

  it("includes examples in help output", () => {
    const cmd = new CacooCommand("test").examples([
      { description: "Do something", command: "cacoo test run" },
    ]);
    const help = cmd.helpInformation();
    expect(help).toContain("Examples:");
    expect(help).toContain("$ cacoo test run");
    expect(help).toContain("Do something");
  });

  it("includes env vars in help output", () => {
    const cmd = new CacooCommand("test").envVars([["API_KEY", "The API key"]]);
    const help = cmd.helpInformation();
    expect(help).toContain("Environment variables:");
    expect(help).toContain("API_KEY");
    expect(help).toContain("The API key");
  });

  it("creates nested CacooCommand instances", () => {
    const parent = new CacooCommand("parent");
    const child = parent.createCommand("child");
    expect(child).toBeInstanceOf(CacooCommand);
    expect(child.name()).toBe("child");
  });

  it("adds subcommands via addCommands", async () => {
    const parent = new CacooCommand("parent");
    const child = new CacooCommand("child").description("A child command");

    await parent.addCommands([Promise.resolve({ default: child })]);

    const commands = parent.commands.map((c) => c.name());
    expect(commands).toContain("child");
  });
});
